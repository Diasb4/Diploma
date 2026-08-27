import { Router, Request, Response } from 'express';
import { db } from '../services/storage.js';

export const professorsRouter = Router();

/**
 * GET /api/professors
 */
professorsRouter.get('/', (req: Request, res: Response): void => {
  let list = [...db.professors];
  const { department, search, freeSlotsOnly, sortBy, page = '1', limit = '24' } = req.query;

  if (department && department !== 'ALL') {
    list = list.filter(p => p.department.toLowerCase().includes(String(department).toLowerCase()));
  }

  if (freeSlotsOnly === 'true') {
    list = list.filter(p => p.freeSlots > 0);
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q) ||
      p.courses?.some(c => c.toLowerCase().includes(q)) ||
      p.interests?.some(i => i.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortBy === 'name_desc') {
    list.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
  } else if (sortBy === 'slots') {
    list.sort((a, b) => b.freeSlots - a.freeSlots);
  } else if (sortBy === 'courses') {
    list.sort((a, b) => (b.courses?.length || 0) - (a.courses?.length || 0));
  } else {
    // Default name_asc
    list.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  }

  const pageNum = parseInt(String(page), 10) || 1;
  const limitNum = parseInt(String(limit), 10) || 24;
  const total = list.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = list.slice(startIndex, startIndex + limitNum);

  res.json({
    total,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(total / limitNum),
    professors: paginated
  });
});

/**
 * GET /api/professors/:id
 */
professorsRouter.get('/:id', (req: Request, res: Response): void => {
  const prof = db.professors.find(p => p.id === req.params.id);
  if (!prof) {
    res.status(404).json({ error: 'Преподаватель не найден' });
    return;
  }
  res.json(prof);
});

