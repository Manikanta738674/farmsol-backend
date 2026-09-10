import { ID_PREFIX } from '../constants/id-prefixes';

export class IdGenerator {
  private static currentYear(): number {
    return new Date().getFullYear();
  }

  private static randomPadded(len: number): string {
    const min = Math.pow(10, len - 1);
    const max = Math.pow(10, len) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  public static generateFarmerId(stateCode: string = 'AP', sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.FARMER}-${stateCode.toUpperCase()}-${year}-${seq}`;
  }

  public static generateCentreId(stateCode: string = 'AP', distCode: string = 'VZM', sequence?: number): string {
    const seq = sequence ? sequence.toString().padStart(4, '0') : this.randomPadded(4);
    return `${ID_PREFIX.CENTRE}-${stateCode.toUpperCase()}-${distCode.toUpperCase()}-${seq}`;
  }

  public static generateOperatorId(stateCode: string = 'AP', sequence?: number): string {
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.OPERATOR}-${stateCode.toUpperCase()}-${seq}`;
  }

  public static generateBookingId(sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.BOOKING}-${year}-${seq}`;
  }

  public static generateTokenId(centreShortCode: string = 'PC001', sequence?: number): string {
    const seq = sequence ? sequence.toString().padStart(4, '0') : this.randomPadded(4);
    return `${ID_PREFIX.TOKEN}-${centreShortCode}-${seq}`;
  }

  public static generateProcurementId(sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.PROCUREMENT}-${year}-${seq}`;
  }

  public static generatePaymentId(sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.PAYMENT}-${year}-${seq}`;
  }

  public static generateGrievanceId(sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(5, '0') : this.randomPadded(5);
    return `${ID_PREFIX.GRIEVANCE}-${year}-${seq}`;
  }

  public static generateAuditId(sequence?: number): string {
    const year = this.currentYear();
    const seq = sequence ? sequence.toString().padStart(6, '0') : this.randomPadded(6);
    return `${ID_PREFIX.AUDIT}-${year}-${seq}`;
  }
}
