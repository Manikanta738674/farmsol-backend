import QRCode from 'qrcode';

export class QRService {
  public static async generateQRCodeDataURL(payload: string): Promise<string> {
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 256,
        color: {
          dark: '#14532d', // Forest Green brand color
          light: '#ffffff'
        }
      });
      return dataUrl;
    } catch (err) {
      console.error('[QRService] Failed to generate QR code:', err);
      throw err;
    }
  }

  public static constructPayload(bookingId: string, tokenId: string, centreId: string, farmerId: string): string {
    return JSON.stringify({
      b: bookingId,
      t: tokenId,
      c: centreId,
      f: farmerId,
      ts: Date.now()
    });
  }

  public static parsePayload(qrString: string): { bookingId: string; tokenId: string; centreId: string; farmerId: string } | null {
    try {
      const data = JSON.parse(qrString);
      return {
        bookingId: data.b,
        tokenId: data.t,
        centreId: data.c,
        farmerId: data.f
      };
    } catch {
      return null;
    }
  }
}
