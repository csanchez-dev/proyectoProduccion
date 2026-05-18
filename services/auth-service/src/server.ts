// src/server.ts
import dotenv from 'dotenv';
dotenv.config(); // asegurarse de cargar .env antes de app

import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Auth-service corriendo en puerto ${PORT}`);
});