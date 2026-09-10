import { UserRole } from '../constants/stages';

export interface IUserPayload {
  userId: string;
  role: UserRole;
  phone: string;
  name: string;
  centreIds?: string[];
}

export interface IAuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    role: UserRole;
    phone: string;
    name: string;
    entityId: string; // farmerId, operatorId, or adminId
    centreIds?: string[];
  };
}
