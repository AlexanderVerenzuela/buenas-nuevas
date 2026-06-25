import express from 'express';
import { db } from '../db';
import { meetings, youths, attendances } from '../db/schema';
import { eq, count, getTableColumns } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Obtener todas las reuniones
router.get('/', async (req, res) => {
  try {
    // In drizzle, to get relations + count of a relation, we can fetch all and map, or use a left join
    // Using Drizzle relational API for simplicity
    const meetingsList = await db.query.meetings.findMany({
      with: {
        leader: true,
        attendances: true,
      },
      orderBy: (meetings, { desc }) => [desc(meetings.date)],
    });
    
    // Format to match prisma output (_count)
    const formatted = meetingsList.map(m => {
      const { attendances, ...rest } = m;
      return {
        ...rest,
        _count: { attendances: attendances.length }
      }
    });

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener reuniones' });
  }
});

// Obtener una reunión por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await db.query.meetings.findFirst({
      where: eq(meetings.id, id),
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
    
    const youthList = await db.query.youths.findMany({
      where: eq(youths.isActive, true),
      with: {
        attendances: {
          where: eq(attendances.meetingId, id)
        }
      },
      orderBy: (youths, { asc }) => [asc(youths.firstName)]
    });

    res.json(youthList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener asistencia' });
  }
});

// Crear reunión
router.post('/', async (req, res) => {
  try {
    const { title, type, date, time, location, description, leaderId, photoUrl, preacher, preachingTheme, subType, meetingNotes } = req.body;
    
    const [newMeeting] = await db.insert(meetings).values({
      title,
      type,
      date: new Date(date),
      time,
      location,
      description,
      photoUrl,
      leaderId: leaderId || null,
      preacher: preacher || null,
      preachingTheme: preachingTheme || null,
      subType: subType || null,
      meetingNotes: meetingNotes || null,
      status: 'SCHEDULED',
    }).returning();
    
    res.status(201).json({ success: true, meeting: newMeeting });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear reunión' });
  }
});

// Actualizar reunión
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, date, time, location, description, photoUrl, preacher, preachingTheme, subType, meetingNotes } = req.body;
    
    const [updatedMeeting] = await db.update(meetings).set({
      title,
      type,
      date: new Date(date),
      time,
      location,
      description,
      photoUrl,
      preacher: preacher !== undefined ? preacher : null,
      preachingTheme: preachingTheme !== undefined ? preachingTheme : null,
      subType: subType !== undefined ? subType : null,
      meetingNotes: meetingNotes !== undefined ? meetingNotes : null,
    }).where(eq(meetings.id, id)).returning();
    
    res.json({ success: true, meeting: updatedMeeting });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar reunión' });
  }
});

// Eliminar reunión
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(meetings).where(eq(meetings.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar reunión' });
  }
});

export default router;
