import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const recentMeetings = await prisma.meeting.findMany({
      orderBy: { date: "desc" },
      take: 5,
      include: {
        _count: { select: { attendances: { where: { status: "PRESENT" } } } }
      }
    });

    const inactiveOrAlertYouths = await prisma.youth.findMany({
      where: { 
        status: "INACTIVE"
      },
      include: { leader: true }
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
