import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Almacenamos el archivo temporalmente en memoria en lugar del disco duro local
const storage = multer.memoryStorage();

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Límite de 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/i;
    const isMimeTypeValid = allowedTypes.test(file.mimetype);
    const isExtensionValid = allowedTypes.test(file.originalname.split('.').pop() || '');
    
    if (isMimeTypeValid && isExtensionValid) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
  }
});

router.post('/', authenticateToken, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
      }
      
      // Convertimos el buffer a una cadena de Base64 Data URI
      const base64Data = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;
      const fileUrl = `data:${mimeType};base64,${base64Data}`;
      
      res.json({ url: fileUrl });
    } catch (error) {
      res.status(500).json({ error: 'Error al procesar la imagen' });
    }
  });
});

export default router;
