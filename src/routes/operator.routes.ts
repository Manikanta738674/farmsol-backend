import { Router } from 'express';
import { OperatorController } from '../controllers/operator.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { enforceCentreAccess } from '../middlewares/centre-guard.middleware';
import { UserRole } from '@smartfarmer/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole([UserRole.OPERATOR, UserRole.CENTRE_MANAGER, UserRole.ADMIN]));
router.use(enforceCentreAccess);

router.get('/dashboard', OperatorController.getDashboard);
router.post('/gate/scan', OperatorController.scanGateQR);
router.post('/quality', OperatorController.recordQuality);
router.post('/weighing', OperatorController.recordWeighing);
router.post('/procurement/complete', OperatorController.completeProcurement);
router.post('/payment/settle', OperatorController.settlePayment);
router.get('/reports', OperatorController.getDailyReports);

export default router;
