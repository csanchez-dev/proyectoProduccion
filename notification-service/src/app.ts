import express from 'express';
import cors from 'cors';
import notificationRoutes from './routes/notificationRoutes';

const app = express();

// Enable CORS for all origins (adjust in production to restrict origins)
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Keep original route and also expose under /api/notifications to match frontend proxy
app.use('/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

export default app;