import { QueueStage, BookingStatus } from '@smartfarmer/shared';
import { BookingModel } from '../models/Booking.model';
import { CentreModel } from '../models/Centre.model';

export interface IStageAverages {
  [QueueStage.GATE_ENTRY]: number;
  [QueueStage.WAITING]: number;
  [QueueStage.QUALITY_ASSAYING]: number;
  [QueueStage.WEIGHING]: number;
  [QueueStage.PROCUREMENT]: number;
  [QueueStage.COMPLETED]: number;
}

export class ETAEngineService {
  // Baseline moving averages in minutes per farmer per counter
  private static stageBaselineMinutes: IStageAverages = {
    [QueueStage.GATE_ENTRY]: 2,
    [QueueStage.WAITING]: 3,
    [QueueStage.QUALITY_ASSAYING]: 5,
    [QueueStage.WEIGHING]: 7,
    [QueueStage.PROCUREMENT]: 4,
    [QueueStage.COMPLETED]: 0
  };

  /**
   * Calculate dynamic estimated wait time and farmers ahead for a given booking
   */
  public static async calculateETA(bookingId: string): Promise<{
    estimatedWaitMinutes: number;
    farmersAhead: number;
    currentStage: QueueStage;
    centreLoadPercentage: number;
    currentServedToken: string | null;
  }> {
    const booking = await BookingModel.findOne({ bookingId });
    if (!booking) {
      return {
        estimatedWaitMinutes: 0,
        farmersAhead: 0,
        currentStage: QueueStage.GATE_ENTRY,
        centreLoadPercentage: 0,
        currentServedToken: null
      };
    }

    if (booking.status === BookingStatus.COMPLETED) {
      return {
        estimatedWaitMinutes: 0,
        farmersAhead: 0,
        currentStage: QueueStage.COMPLETED,
        centreLoadPercentage: 0,
        currentServedToken: null
      };
    }

    const centre = await CentreModel.findOne({ centreId: booking.centreId });
    const counters = centre?.operatingCounters || 3;

    // Find all active bookings for this centre today that are ahead in sequence
    const stageOrder = [
      QueueStage.GATE_ENTRY,
      QueueStage.WAITING,
      QueueStage.QUALITY_ASSAYING,
      QueueStage.WEIGHING,
      QueueStage.PROCUREMENT
    ];

    const currentStageIndex = stageOrder.indexOf(booking.currentStage as QueueStage);

    // Active farmers ahead in the queue at the same centre
    const activeAheadQuery = {
      centreId: booking.centreId,
      bookingDate: booking.bookingDate,
      status: { $in: [BookingStatus.ARRIVED, BookingStatus.IN_QUEUE, BookingStatus.PROCESSING] },
      tokenSequence: { $lt: booking.tokenSequence }
    };

    const farmersAheadCount = await BookingModel.countDocuments(activeAheadQuery);

    // Find currently served token in the centre
    const currentlyServing = await BookingModel.findOne({
      centreId: booking.centreId,
      status: BookingStatus.PROCESSING
    }).sort({ updatedAt: -1 });

    // Calculate sum of remaining stage times
    let stageCumulativeMinutes = 0;
    if (currentStageIndex >= 0) {
      for (let i = currentStageIndex; i < stageOrder.length; i++) {
        const stage = stageOrder[i];
        stageCumulativeMinutes += this.stageBaselineMinutes[stage];
      }
    } else {
      stageCumulativeMinutes = 15; // default unarrived estimate
    }

    // Dynamic queue backlog time = (farmers ahead * average processing time per counter)
    const queueBacklogMinutes = Math.round((farmersAheadCount * 8) / Math.max(1, counters));
    const totalEstimatedWait = Math.max(2, queueBacklogMinutes + stageCumulativeMinutes);

    // Centre load factor
    const totalTodayBookings = await BookingModel.countDocuments({
      centreId: booking.centreId,
      bookingDate: booking.bookingDate,
      status: { $ne: BookingStatus.CANCELLED }
    });
    const maxDayCapacity = Math.round((centre?.dailyCapacityQuintals || 2000) / 40); // avg 40 quintals per booking
    const centreLoadPercentage = Math.min(100, Math.round((totalTodayBookings / Math.max(1, maxDayCapacity)) * 100));

    return {
      estimatedWaitMinutes: totalEstimatedWait,
      farmersAhead: farmersAheadCount,
      currentStage: booking.currentStage as QueueStage,
      centreLoadPercentage,
      currentServedToken: currentlyServing ? currentlyServing.tokenId : null
    };
  }
}
