import express from 'express';
import { db } from '../db';
import { discipleshipGroups } from '../db/schema';
import { eq } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    const groups = await db.query.discipleshipGroups.findMany({
      with: {
        leader: true,
        members: true,
      },
      orderBy: (groups, { asc }) => [asc(groups.name)],
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener grupos' });
  }
});

// Crear grupo
router.post('/', async (req, res) => {
  try {
    const { name, description, meetingDay, meetingTime, location, leaderId, coLeaderName, isActive } = req.body;
    
    const [newGroup] = await db.insert(discipleshipGroups).values({
      name,
      description,
      meetingDay,
      meetingTime,
      location,
      leaderId,
      coLeaderName,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();
    
    res.status(201).json({ success: true, group: newGroup });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear grupo' });
  }
});

// Actualizar grupo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, meetingDay, meetingTime, location, leaderId, coLeaderName, isActive } = req.body;
    
    const [updatedGroup] = await db.update(discipleshipGroups).set({
      name,
      description,
      meetingDay,
      meetingTime,
      location,
      leaderId,
      coLeaderName,
      isActive,
    }).where(eq(discipleshipGroups.id, id)).returning();
    
    res.json({ success: true, group: updatedGroup });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
});

// Eliminar grupo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(discipleshipGroups).where(eq(discipleshipGroups.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

export default router;
