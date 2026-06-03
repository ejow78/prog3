import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import carreraRoutes from './routes/carreraRoutes.js';
import preinscripcionRoutes from './routes/preinscripcionRoutes.js';
import mensajeRoutes from './routes/mensajeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import authRoutes from './routes/authRoutes.js';
import inscripcionExamenRoutes from './routes/inscripcionExamenRoutes.js';
import fechaExamenRoutes from './routes/fechaExamenRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ieslacocha';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/carreras', carreraRoutes);
app.use('/api/preinscripciones', preinscripcionRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inscripciones-examenes', inscripcionExamenRoutes);
app.use('/api/fechas-examenes', fechaExamenRoutes);
app.use('/api/auditorias', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Connect to MongoDB and start server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error conectando a MongoDB:', error.message);
  });
