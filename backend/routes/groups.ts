import express from 'express';
import { db } from '../db';
import { discipleshipGroups, youths, leaders } from '../db/schema';
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
    
    // Obtener los datos del líder para generar el nombre por defecto si no viene
    const leaderObj = await db.query.leaders.findFirst({
      where: eq(leaders.id, leaderId),
    });
    const finalName = name || `Grupo de ${leaderObj?.firstName || ''} ${leaderObj?.lastName || ''}`.trim();

    const [newGroup] = await db.insert(discipleshipGroups).values({
      name: finalName,
      description: description || null,
      meetingDay: meetingDay || null,
      meetingTime: meetingTime || null,
      location: location || null,
      leaderId,
      coLeaderName: coLeaderName || null,
      isActive: isActive !== undefined ? isActive : true,
    }).returning();
    
    // Devolver el grupo recién creado con el líder poblado para que el frontend lo dibuje al instante
    const fullGroup = await db.query.discipleshipGroups.findFirst({
      where: eq(discipleshipGroups.id, newGroup.id),
      with: {
        leader: true,
        members: true,
      }
    });

    res.status(201).json({ success: true, group: fullGroup });
  } catch (error) {
    console.error("Error al crear grupo:", error);
    res.status(500).json({ error: 'Error al crear grupo' });
  }
});

// Actualizar miembros del grupo de discipulado
router.put('/:id/members', async (req, res) => {
  try {
    const { id } = req.params; // groupId
    const { youthIds } = req.body; // array de IDs de jóvenes
    
    // Obtener el líder de este grupo para asignárselo a los jóvenes también y mantener sincronizado
    const group = await db.query.discipleshipGroups.findFirst({
      where: eq(discipleshipGroups.id, id),
    });
    const leaderId = group?.leaderId || null;

    // 1. Quitar de este grupo a todos los jóvenes que actualmente pertenecen a él
    await db.update(youths)
      .set({ groupId: null, leaderId: null })
      .where(eq(youths.groupId, id));
      
    // 2. Asignar los nuevos jóvenes a este grupo y a este líder
    if (youthIds && youthIds.length > 0) {
      for (const yId of youthIds) {
        await db.update(youths)
          .set({ groupId: id, leaderId: leaderId })
          .where(eq(youths.id, yId));
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error al actualizar miembros del grupo:", error);
    res.status(500).json({ error: 'Error al actualizar miembros del grupo' });
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
    
    // Primero, liberar a los jóvenes que pertenecían a este grupo
    await db.update(youths)
      .set({ groupId: null, leaderId: null })
      .where(eq(youths.groupId, id));

    await db.delete(discipleshipGroups).where(eq(discipleshipGroups.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar grupo' });
  }
});

export default router;
