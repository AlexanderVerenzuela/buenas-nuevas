import express from 'express';
import { prisma } from '../prisma';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware para requerir autenticación en todas las rutas de jóvenes
router.use(authenticateToken);

// Obtener todos los jóvenes
router.get('/', async (req, res) => {
  try {
    const youthList = await prisma.youth.findMany({
      include: {
        leader: true,
        group: true,
      },
      orderBy: { createdAt: 'desc' },
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
    const youth = await prisma.youth.findUnique({
      where: { id },
      include: {
        leader: true,
        group: true,
        attendances: {
          include: { meeting: true },
          orderBy: { meeting: { date: 'desc' } },
          take: 10,
        },
      },
    });

    if (!youth) return res.status(404).json({ error: 'Joven no encontrado' });
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

    const existingYouth = await prisma.youth.findFirst({
      where: { firstName, lastName },
    });

    if (existingYouth) {
      return res.status(400).json({ error: 'Este joven ya está registrado en el sistema.' });
    }

    const newYouth = await prisma.youth.create({
      data: {
        firstName,
        lastName,
        phone,
        email,
        status: status || 'VISITOR',
      },
    });

    // Sincronizar Líder
    if (status === 'LEADER') {
      await prisma.leader.create({
        data: {
          youthId: newYouth.id,
          firstName: newYouth.firstName,
          lastName: newYouth.lastName,
          phone: newYouth.phone,
          email: newYouth.email,
          gender: newYouth.gender,
          birthDate: newYouth.birthDate,
        },
      });
    }

    res.status(201).json({ success: true, youth: newYouth });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear joven' });
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

    const updatedYouth = await prisma.youth.update({
      where: { id },
      data: {
        firstName,
        lastName,
        phone,
        status,
        birthDate: birthDate ? new Date(birthDate) : null,
        isStudying,
        career,
        studyCenter,
        isWorking,
        occupation,
        workplace,
        avatarUrl
      },
    });

    res.json({ success: true, youth: updatedYouth });
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

    await prisma.youth.update({
      where: { id },
      data: { observations: notes },
    });

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
    await prisma.youth.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar joven' });
  }
});

export default router;
