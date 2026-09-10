import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { UserRole } from '@smartfarmer/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole([UserRole.ADMIN]));

router.get('/analytics', AdminController.getAnalytics);

// Centres
router.get('/centres', AdminController.getCentres);
router.post('/centres', AdminController.createCentre);
router.patch('/centres/:centreId', AdminController.updateCentre);

// Crops & MSP Rates
router.get('/crops', AdminController.getCrops);
router.get('/rates', AdminController.getRates);
router.post('/rates', AdminController.updateRate);

// Operators
router.get('/operators', AdminController.getOperators);
router.post('/operators', AdminController.createOperator);

// Slots
router.post('/slots/generate', AdminController.generateSlots);

// Audit & Grievances
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/grievances', AdminController.getGrievances);
router.patch('/grievances/:grievanceId', AdminController.resolveGrievance);

export default router;
