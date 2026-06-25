import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';
import { AttendanceStatus } from '@prisma/client';

const router = express.Router();

router.use(authenticateToken);

// Marcar asistencia individual
router.post('/mark', async (req, res) => {
  try {
    const { meetingId, youthId, status } = req.body;
    
    await prisma.attendance.upsert({
      where: {
        youthId_meetingId: {
          youthId,
          meetingId,
        },
      },
      update: { status },
      create: {
        meetingId,
        youthId,
        status,
      },
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al marcar asistencia' });
  }
});

// Guardar asistencia en lote
router.post('/bulk', async (req, res) => {
  try {
    const { meetingId, attendances } = req.body; // attendances: { youthId, status }[]
    
    const allYouth = await prisma.youth.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    const markedYouthIds = new Set(attendances.map((a: any) => a.youthId));
    const operations = [];

    // Para los marcados
    for (const { youthId, status } of attendances) {
      operations.push(
        prisma.attendance.upsert({
          where: { youthId_meetingId: { youthId, meetingId } },
          update: { status },
          create: { meetingId, youthId, status },
        })
      );
    }

    // Para los no tocados (ABSENT)
    for (const youth of allYouth) {
      if (!markedYouthIds.has(youth.id)) {
        operations.push(
          prisma.attendance.upsert({
            where: { youthId_meetingId: { youthId: youth.id, meetingId } },
            update: { status: 'ABSENT' as AttendanceStatus },
            create: { meetingId, youthId: youth.id, status: 'ABSENT' as AttendanceStatus },
          })
        );
      }
    }

    await prisma.$transaction(operations, {
      timeout: 20000,
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar asistencia en lote' });
  }
});

export default router;
