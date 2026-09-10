import { QueueStage } from '../constants/stages';

export interface IQueueEvent {
  _id?: string;
  eventId: string;
  bookingId: string;
  centreId: string;
  tokenId: string;
  stage: QueueStage;
  eventType: 'STAGE_ENTERED' | 'TOKEN_CALLED' | 'STAGE_COMPLETED' | 'STAGE_PAUSED' | 'DELAYED' | 'NO_SHOW';
  timestamp: Date;
  operatorId: string;
  note?: string;
}

export interface IStageQueueSummary {
  stage: QueueStage;
  activeToken: string | null;
  waitingCount: number;
  tokens: Array<{
    tokenId: string;
    bookingId: string;
    farmerName: string;
    cropName: string;
    quantityQuintals: number;
    arrivedAt: string;
    stageEnteredAt: string;
  }>;
}

export interface ILiveQueueState {
  centreId: string;
  centreName: string;
  currentServedToken: string | null;
  farmerToken: string;
  farmersAhead: number;
  currentStage: QueueStage;
  estimatedWaitMinutes: number;
  centreLoadPercentage: number;
  lastUpdated: string;
}

export interface ISmartSlotRecommendation {
  slotId: string;
  centreId: string;
  centreName: string;
  date: string;
  timeWindow: string;
  predictedWaitMinutes: number;
  loadFactorPercentage: number;
  isRecommended: boolean;
  explanation: string;
}
