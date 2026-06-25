import express from 'express';
import { db } from '../db';
import { youths, leaders } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware para requerir autenticación en todas las rutas de jóvenes
router.use(authenticateToken);

// Obtener todos los jóvenes
router.get('/', async (req, res) => {
  try {
    const youthList = await db.query.youths.findMany({
      with: {
        leader: true,
        group: true,
      },
      orderBy: (youths, { desc }) => [desc(youths.createdAt)],
    });
    res.json(youthList);
  } catch (error) {
    console.error("GET /api/youth ERROR DETALLADO:", error);
    res.status(500).json({ error: 'Error al obtener jóvenes' });
  }
});

// Obtener un joven por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const youth = await db.query.youths.findFirst({
      where: eq(youths.id, id),
      with: {
        leader: true,
        group: true,
        attendances: {
          with: { meeting: true },
          orderBy: (attendances, { desc }) => [desc(attendances.createdAt)], // Meeting date would need a join for order by, falling back to attendance creation
          limit: 10,
        },
      },
    });

    if (!youth) return res.status(404).json({ error: 'Joven no encontrado' });

    // Sort attendances by meeting date locally since Drizzle relational query doesn't support nested relation ordering easily
    if (youth.attendances) {
      youth.attendances.sort((a: any, b: any) => new Date(b.meeting.date).getTime() - new Date(a.meeting.date).getTime());
    }

    res.json(youth);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener joven' });
  }
});

// Crear un joven
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, phone, email, status } = req.body;

    const safeFirstName = firstName || '';
    const safeLastName = lastName || '';

    const existingYouth = await db.query.youths.findFirst({
      where: and(eq(youths.firstName, safeFirstName), eq(youths.lastName, safeLastName)),
    });

    if (existingYouth) {
      return res.status(400).json({ error: 'Este joven ya está registrado en el sistema.' });
    }

    const newYouthArray = await db.insert(youths).values({
      firstName: safeFirstName,
      lastName: safeLastName,
      phone: phone || null,
      email: email || null,
      status: status || 'VISITOR',
      updatedAt: new Date(),
    }).returning();

    const newYouth = newYouthArray[0];

    // Sincronizar Líder
    if (status === 'LEADER' && newYouth) {
      await db.insert(leaders).values({
        youthId: newYouth.id,
        firstName: newYouth.firstName,
        lastName: newYouth.lastName,
        phone: newYouth.phone,
        email: newYouth.email,
        gender: newYouth.gender,
        birthDate: newYouth.birthDate,
      });
    }

    res.status(201).json({ success: true, youth: newYouth });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Error al crear joven' });
  }
});

// Actualizar información de un joven
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, phone, status, birthDate,
      isStudying, career, studyCenter,
      isWorking, occupation, workplace,
      avatarUrl
    } = req.body;

    const updatedYouthArray = await db.update(youths)
      .set({
        firstName,
        lastName,
        phone,
        status,
        birthDate: birthDate ? new Date(birthDate + 'T12:00:00Z') : null,
        isStudying,
        career,
        studyCenter,
        isWorking,
        occupation,
        workplace,
        avatarUrl
      })
      .where(eq(youths.id, id))
      .returning();

    res.json({ success: true, youth: updatedYouthArray[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar joven' });
  }
});

// Actualizar notas/observaciones
router.patch('/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    await db.update(youths)
      .set({ observations: notes })
      .where(eq(youths.id, id));

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar notas' });
  }
});

// Eliminar un joven
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(youths).where(eq(youths.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar joven' });
  }
});

export default router;
