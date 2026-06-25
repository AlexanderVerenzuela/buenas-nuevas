import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todas las reuniones
router.get('/', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        leader: true,
        _count: {
          select: { attendances: true }
        }
      },
      orderBy: { date: 'desc' },
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reuniones' });
  }
});

// Obtener una reunión por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await prisma.meeting.findUnique({
      where: { id },
    });
    if (!meeting) return res.status(404).json({ error: 'Reunión no encontrada' });
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reunión' });
  }
});

// Obtener lista de jóvenes y su asistencia para una reunión específica
router.get('/:id/attendance', async (req, res) => {
  try {
    const { id } = req.params;
    const youthList = await prisma.youth.findMany({
      where: { isActive: true },
      include: {
        attendances: {
          where: { meetingId: id }
        }
      },
      orderBy: { firstName: 'asc' }
    });
    res.json(youthList);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

// Crear reunión
router.post('/', async (req, res) => {
  try {
    const { title, type, date, time, location, description, leaderId, photoUrl } = req.body;
    
    const newMeeting = await prisma.meeting.create({
      data: {
        title,
        type,
        date: new Date(date),
        time,
        location,
        description,
        photoUrl,
        leaderId: leaderId || null,
        status: 'SCHEDULED',
      },
    });
    
    res.status(201).json({ success: true, meeting: newMeeting });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear reunión' });
  }
});

// Actualizar reunión
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, date, time, location, description, photoUrl } = req.body;
    
    const updatedMeeting = await prisma.meeting.update({
      where: { id },
      data: {
        title,
        type,
        date: new Date(date),
        time,
        location,
        description,
        photoUrl,
      },
    });
    
    res.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar reunión' });
  }
});

// Eliminar reunión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.meeting.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar reunión' });
  }
});

export default router;
