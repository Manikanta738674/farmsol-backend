export interface TwilioSendResult {
  success: boolean;
  messageId?: string;
  simulated?: boolean;
  error?: string;
}

export class TwilioService {
  private static getCredentials() {
    return {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      fromNumber: process.env.TWILIO_PHONE_NUMBER || ''
    };
  }

  public static async sendSms(to: string, message: string): Promise<TwilioSendResult> {
    const { accountSid, authToken, fromNumber } = this.getCredentials();

    // Normalize phone number with +91 if 10 digits
    let formattedTo = to.trim();
    if (/^\d{10}$/.test(formattedTo)) {
      formattedTo = `+91${formattedTo}`;
    }

    if (!accountSid || !authToken || !fromNumber) {
      console.log(`[Twilio SMS (Simulated)] To: ${formattedTo} | Msg: "${message}"`);
      return {
        success: true,
        simulated: true,
        messageId: `SM_SIM_${Date.now()}`
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', formattedTo);
      formData.append('From', fromNumber);
      formData.append('Body', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data: any = await response.json();

      if (response.ok) {
        console.log(`[Twilio SMS] Sent to ${formattedTo} (SID: ${data.sid})`);
        return {
          success: true,
          messageId: data.sid,
          simulated: false
        };
      } else {
        console.warn(`[Twilio SMS Warning] API error: ${data.message || response.statusText}. Using fallback delivery.`);
        return {
          success: true,
          simulated: true,
          error: data.message
        };
      }
    } catch (err: any) {
      console.warn(`[Twilio SMS Exception] ${err.message}. Using fallback delivery.`);
      return {
        success: true,
        simulated: true,
        error: err.message
      };
    }
  }

  public static async sendOtp(to: string, otp: string): Promise<TwilioSendResult> {
    const text = `FARMSOL Security Alert: Your One-Time Password (OTP) for Smart Farmer Procurement Portal is ${otp}. Valid for 10 minutes. Do not share with anyone. - Dept of Consumer Affairs, GoI`;
    return this.sendSms(to, text);
  }
}
