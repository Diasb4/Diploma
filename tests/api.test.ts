import fs from 'fs';
import os from 'os';
import path from 'path';
import type { Server } from 'http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('AITU Diploma API integration', () => {
  let server: Server;
  let baseUrl = '';
  let temporaryDirectory = '';
  let token = '';
  let studentId = '';

  beforeAll(async () => {
    temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'aitu-diploma-test-'));
    process.env.DATA_FILE = path.join(temporaryDirectory, 'runtime-state.sqlite');
    process.env.AUTH_SECRET = 'integration-test-secret-with-sufficient-length';
    const { createApp } = await import('../server/src/app.js');
    server = createApp().listen(0);
    await new Promise<void>((resolve) => server.once('listening', resolve));
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Test server did not start');
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    const { db } = await import('../server/src/services/storage.js');
    db.close();
    fs.rmSync(temporaryDirectory, { recursive: true, force: true });
  });

  it('serves normalized catalog data and health metadata', async () => {
    const health = await fetch(`${baseUrl}/api/health`);
    expect(health.status).toBe(200);
    expect(health.headers.get('x-content-type-options')).toBe('nosniff');
    const response = await fetch(`${baseUrl}/api/topics`);
    const body = await response.json() as { topics: Array<Record<string, unknown>> };
    expect(response.status).toBe(200);
    expect(body.topics.length).toBeGreaterThan(20);
    expect(body.topics[0]).toMatchObject({ school: expect.any(String), availableSlots: expect.any(Number) });
    expect(body.topics[0]).not.toHaveProperty('school_id');
  });

  it('creates a signed session and protects private data', async () => {
    const unauthorized = await fetch(`${baseUrl}/api/notifications/220107042`);
    expect(unauthorized.status).toBe(401);
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student.2026@astanait.edu.kz' })
    });
    const body = await response.json() as { token: string; user: { studentId: string } };
    expect(response.status).toBe(200);
    expect(body.token.split('.')).toHaveLength(2);
    token = body.token;
    studentId = body.user.studentId;
    const authorized = await fetch(`${baseUrl}/api/notifications/${studentId}`, { headers: { Authorization: `Bearer ${token}` } });
    expect(authorized.status).toBe(200);
  });

  it('reserves and cancels a topic atomically and persists the state file', async () => {
    const topicsResponse = await fetch(`${baseUrl}/api/topics?school=SIS&onlyAvailable=true`);
    const topicsBody = await topicsResponse.json() as { topics: Array<{ id: string; availableSlots: number }> };
    const topic = topicsBody.topics[0];
    const reservation = await fetch(`${baseUrl}/api/applications/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        topicId: topic.id,
        members: [{ fullName: 'Диас Касымов', studentId, school: 'SIS', track: 'Software Engineering', email: 'student.2026@astanait.edu.kz', role: 'Капитан' }],
        projectDescription: 'Интеграционный тест процесса бронирования.'
      })
    });
    const reservationBody = await reservation.json() as { application: { id: string }; remainingSlots: number };
    expect(reservation.status).toBe(201);
    expect(reservationBody.remainingSlots).toBe(topic.availableSlots - 1);
    expect(fs.existsSync(path.join(temporaryDirectory, 'runtime-state.sqlite'))).toBe(true);
    const cancellation = await fetch(`${baseUrl}/api/applications/${reservationBody.application.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    expect(cancellation.status).toBe(200);
  });
});
