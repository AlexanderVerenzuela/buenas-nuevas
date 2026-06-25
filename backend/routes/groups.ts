import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todos los grupos
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.discipleshipGroup.findMany({
      include: {
        leader: true,
        members: true,
      },
      orderBy: { name: 'asc' },
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
    
    const newGroup = await prisma.discipleshipGroup.create({
      data: {
        name,
        description,
        meetingDay,
        meetingTime,
        location,
        leaderId,
        coLeaderName,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    
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
    
    const updatedGroup = await prisma.discipleshipGroup.update({
      where: { id },
      data: {
        name,
        description,
        meetingDay,
        meetingTime,
        location,
        leaderId,
        coLeaderName,
        isActive,
      },
    });
    
    res.json({ success: true, group: updatedGroup });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar grupo' });
  }
});

// Eliminar grupo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.discipleshipGroup.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

export default router;
