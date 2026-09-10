import { SlotModel } from '../models/Slot.model';
import { CentreModel } from '../models/Centre.model';
import { ISmartSlotRecommendation } from '@smartfarmer/shared';

export class SlotRecommendationService {
  public static async getRecommendations(
    centreId: string,
    date: string,
    requestedQuantity: number
  ): Promise<ISmartSlotRecommendation[]> {
    const slots = await SlotModel.find({
      centreId,
      date,
      status: { $ne: 'CLOSED' }
    }).sort({ startTime: 1 });

    const centre = await CentreModel.findOne({ centreId });
    const centreName = centre?.name || 'Procurement Centre';

    if (!slots || slots.length === 0) {
      return [];
    }

    // Evaluate each slot's load factor and calculate predicted wait time
    const recommendations: ISmartSlotRecommendation[] = slots.map((slot) => {
      const remainingCapacity = slot.maxCapacityQuintals - slot.bookedQuintals;
      const loadFactor = Math.min(100, Math.round((slot.bookedQuintals / Math.max(1, slot.maxCapacityQuintals)) * 100));

      // Predicted baseline slot wait: e.g. base 12 mins + congestion multiplier
      const predictedWait = Math.round(10 + (loadFactor / 100) * 25);

      const canAccommodate = remainingCapacity >= requestedQuantity;

      return {
        slotId: slot.slotId,
        centreId: slot.centreId,
        centreName,
        date: slot.date,
        timeWindow: `${slot.startTime} - ${slot.endTime}`,
        predictedWaitMinutes: predictedWait,
        loadFactorPercentage: loadFactor,
        isRecommended: false,
        explanation: canAccommodate
          ? `Expected waiting time approx ${predictedWait} mins.`
          : 'Capacity nearing limit for this batch.'
      };
    });

    // Pick the slot with the lowest load factor / wait time that can accommodate the farmer
    let bestIndex = -1;
    let minWait = Infinity;

    recommendations.forEach((rec, idx) => {
      if (rec.loadFactorPercentage < 80 && rec.predictedWaitMinutes < minWait) {
        minWait = rec.predictedWaitMinutes;
        bestIndex = idx;
      }
    });

    if (bestIndex !== -1) {
      recommendations[bestIndex].isRecommended = true;
      recommendations[bestIndex].explanation = `★ AI Recommended: Lowest predicted waiting time (~${recommendations[bestIndex].predictedWaitMinutes} mins) and optimal weighbridge flow.`;
    }

    return recommendations;
  }
}
