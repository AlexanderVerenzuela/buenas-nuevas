import express from 'express'; // Force restart
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import youthRoutes from './routes/youth';
import leaderRoutes from './routes/leaders';
import attendanceRoutes from './routes/attendance';
import groupRoutes from './routes/groups';
import meetingRoutes from './routes/meetings';
import reportsRoutes from './routes/reports';
import uploadRoutes from './routes/upload';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Servir la carpeta de fotos estáticamente
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/youth', youthRoutes);
app.use('/api/leaders', leaderRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/upload', uploadRoutes);

// Manejo de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Hubo un error en el servidor.' });
});

app.listen(PORT, () => {
  console.log(`Servidor Backend corriendo en el puerto ${PORT}`);
});
