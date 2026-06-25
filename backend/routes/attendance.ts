import express from 'express';
import { db } from '../db';
import { youths, attendances } from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

// Guardar asistencia en lote
router.post('/bulk', async (req, res) => {
  try {
    const { meetingId, attendances: attendanceData } = req.body; // attendanceData: { youthId, status }[]
    
    const allYouth = await db.query.youths.findMany({
      where: eq(youths.isActive, true),
      columns: { id: true }
    });

    const markedYouthIds = new Set(attendanceData.map((a: any) => a.youthId));
    
    const insertPayload: any[] = [];

    // Para los marcados
    for (const { youthId, status } of attendanceData) {
      insertPayload.push({
        meetingId,
        youthId,
        status,
      });
    }

    // Para los no tocados (ABSENT)
    for (const youth of allYouth) {
      if (!markedYouthIds.has(youth.id)) {
        insertPayload.push({
          meetingId,
          youthId: youth.id,
          status: 'ABSENT',
        });
      }
    }

    if (insertPayload.length > 0) {
      await db.insert(attendances)
        .values(insertPayload)
        .onConflictDoUpdate({
          target: [attendances.youthId, attendances.meetingId],
          set: {
            status: sql`EXCLUDED.status`
          }
        });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al guardar asistencia en lote' });
  }
});

export default router;
