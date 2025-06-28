export const routingServiceContent = `
import express from 'express';
import userRoutes from '../routes/user';

const router = express.Router();

router.use('/api/user', userRoutes);

export default router;
`;
