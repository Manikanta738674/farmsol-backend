import { Router } from 'express';
import { QueueController } from '../controllers/queue.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Live booking queue status
router.get('/status/:bookingId', QueueController.getBookingQueueStatus);

// Operator queue management
router.post('/call/:tokenId', authenticate, QueueController.callToken);
router.post('/no-show/:tokenId', authenticate, QueueController.markNoShow);

export default router;
