import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole } from '@smartfarmer/shared';

export const enforceCentreAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  // Admins have global access
  if (user.role === UserRole.ADMIN) {
    return next();
  }

  const targetCentreId = req.params.centreId || req.body.centreId || req.query.centreId;

  if (!targetCentreId) {
    return next();
  }

  // Check if operator's assigned centres include the requested centre
  if (user.role === UserRole.OPERATOR || user.role === UserRole.CENTRE_MANAGER) {
    if (!user.centreIds || !user.centreIds.includes(targetCentreId)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: Operator is not authorized to operate at centre ${targetCentreId}`
      });
    }
  }

  next();
};
