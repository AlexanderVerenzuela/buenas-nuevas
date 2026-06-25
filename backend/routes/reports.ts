import express from 'express';
import { db } from '../db';
import { meetings, youths, attendances } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const meetingsList = await db.query.meetings.findMany({
      orderBy: [desc(meetings.date)],
      limit: 5,
      with: {
        attendances: {
          where: eq(attendances.status, 'PRESENT')
        }
      }
    });

    const recentMeetings = meetingsList.map(m => {
      const { attendances, ...rest } = m;
      return {
        ...rest,
        _count: { attendances: attendances.length }
      }
    });

    const inactiveOrAlertYouths = await db.query.youths.findMany({
      where: eq(youths.status, 'INACTIVE'),
      with: { leader: true }
    });

    res.json({
      recentMeetings,
      inactiveOrAlertYouths,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reportes' });
  }
});

export default router;
