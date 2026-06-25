import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todos los líderes
router.get('/', async (req, res) => {
  try {
    const leaders = await prisma.leader.findMany({
      include: {
        assignedYouth: true,
      },
      orderBy: { firstName: 'asc' },
    });
    res.json(leaders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener líderes' });
  }
});

// Crear un líder
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, gender, isActive, observations } = req.body;
    
    const newLeader = await prisma.leader.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        gender,
        isActive: isActive !== undefined ? isActive : true,
        observations,
      },
    });
    
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
    
    const updatedLeader = await prisma.leader.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        email,
        gender,
        isActive,
        observations,
      },
    });
    
    res.json({ success: true, leader: updatedLeader });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar líder' });
  }
});

// Eliminar un líder
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.leader.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar líder' });
  }
});

export default router;
