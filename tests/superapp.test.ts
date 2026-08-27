import { describe, it, expect } from 'vitest';
import { TopicSimilarityEngine } from '../server/src/services/similarityEngine.js';
import { AsyncLockManager } from '../server/src/services/mutex.js';
import { Topic } from '../server/src/types.js';

describe('AITU Diploma SuperApp Engine Tests', () => {
  const mockTopics: Topic[] = [
    {
      id: 't-1',
      code: 'SIS-01',
      title: 'Разработка децентрализованного реестра сертификатов на смарт-контрактах Ethereum',
      description: 'Исследование применения распределенного реестра для верификации дипломов и сертификатов AITU.',
      school: 'SIS',
      track: 'Software Engineering',
      difficulty: 'Средний',
      languages: ['RU', 'EN'],
      techStack: ['Solidity', 'React', 'Node.js', 'Web3.js'],
      expectedResults: ['Смарт-контракт ERC-721', 'Веб-дашборд верификации'],
      maxStudents: 3,
      availableSlots: 2,
      supervisorName: 'Др. Ахметов С.',
      status: 'approved'
    },
    {
      id: 't-2',
      code: 'SAIDS-01',
      title: 'Классификация медицинских снимков легких с помощью сверточных нейронных сетей',
      description: 'Применение ResNet и Vision Transformer для раннего выявления пневмонии и патологий.',
      school: 'SAIDS',
      track: 'Data Science',
      difficulty: 'Продвинутый',
      languages: ['RU', 'EN'],
      techStack: ['Python', 'PyTorch', 'FastAPI', 'OpenCV'],
      expectedResults: ['Модель с точностью > 92%', 'REST API микросервис'],
      maxStudents: 2,
      availableSlots: 1,
      supervisorName: 'Проф. Ибраев М.',
      status: 'approved'
    }
  ];

  describe('1. Topic Similarity & Duplicate Engine', () => {
    const engine = new TopicSimilarityEngine();

    it('should detect a direct duplicate or near-duplicate topic', () => {
      const candidateTitle = 'Децентрализованный реестр сертификатов на смарт контрактах Ethereum и Solidity';
      const candidateDesc = 'Верификация дипломов и сертификатов студентов AITU на блокчейне.';

      const result = engine.checkTopicSimilarity(candidateTitle, candidateDesc, mockTopics);

      expect(result.score).toBeGreaterThanOrEqual(60);
      expect(['DUPLICATE', 'WARNING']).toContain(result.verdict);
      expect(result.matchedKeywords.length).toBeGreaterThan(0);
      expect(result.matchedTopics.length).toBeGreaterThan(0);
      expect(result.matchedTopics[0].topicCode).toBe('SIS-01');
    });

    it('should mark a completely distinct topic as SAFE', () => {
      const candidateTitle = 'Энергоэффективный протокол маршрутизации для беспроводных сенсорных сетей LoRaWAN';
      const candidateDesc = 'Оптимизация потребления батареи в датчиках мониторинга умного кампуса.';

      const result = engine.checkTopicSimilarity(candidateTitle, candidateDesc, mockTopics);

      expect(result.score).toBeLessThan(40);
      expect(result.verdict).toBe('SAFE');
    });
  });

  describe('2. Race Condition Prevention with Async Mutex', () => {
    it('should execute concurrent operations sequentially without race conditions', async () => {
      const lock = new AsyncLockManager();
      let sharedAvailableSlots = 2;
      const executionOrder: number[] = [];

      // Simulate 3 simultaneous booking attempts for 1 slot each
      const bookSlot = async (requestId: number) => {
        return lock.acquire('topic:test-lock', async () => {
          // Simulate async DB delay
          await new Promise((resolve) => setTimeout(resolve, 20));

          if (sharedAvailableSlots > 0) {
            sharedAvailableSlots -= 1;
            executionOrder.push(requestId);
            return { success: true, remaining: sharedAvailableSlots };
          } else {
            return { success: false, remaining: 0 };
          }
        });
      };

      const results = await Promise.all([
        bookSlot(1),
        bookSlot(2),
        bookSlot(3)
      ]);

      // Exactly 2 reservations must succeed and 1 must fail
      const successful = results.filter((r) => r.success);
      const rejected = results.filter((r) => !r.success);

      expect(successful.length).toBe(2);
      expect(rejected.length).toBe(1);
      expect(sharedAvailableSlots).toBe(0);
      expect(executionOrder.length).toBe(2);
    });
  });
});

