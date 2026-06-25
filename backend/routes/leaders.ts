import express from 'express';
import { db } from '../db';
import { leaders } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todos los líderes
router.get('/', async (req, res) => {
  try {
    const leaderList = await db.query.leaders.findMany({
      with: {
        assignedYouth: true,
      },
      orderBy: (leaders, { asc }) => [asc(leaders.firstName)],
    });
    res.json(leaderList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener líderes' });
  }
});

// Crear un líder
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, gender, isActive, observations } = req.body;
    
    const [newLeader] = await db.insert(leaders).values({
      firstName,
      lastName,
      phone,
      email,
      gender,
      isActive: isActive !== undefined ? isActive : true,
      observations,
    }).returning();
    
    res.status(201).json({ success: true, leader: newLeader });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear líder' });
  }
});

// Actualizar un líder
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, email, gender, isActive, observations } = req.body;
    
    const [updatedLeader] = await db.update(leaders).set({
      firstName,
      lastName,
      phone,
      email,
      gender,
      isActive,
      observations,
    }).where(eq(leaders.id, id)).returning();
    
    res.json({ success: true, leader: updatedLeader });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar líder' });
  }
});

// Eliminar un líder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(leaders).where(eq(leaders.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar líder' });
  }
});

export default router;
