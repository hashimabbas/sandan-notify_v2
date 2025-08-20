// /lib/send-whatsapp.ts

import { Twilio } from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

export async function sendWhatsAppMessage({ to, pdfData, fileName }: { to: string, pdfData: Uint8Array, fileName: string }) {
  try {
    // Convert PDF to base64 to send as a media message
    const base64PDF = pdfData.toString("base64");

    const mediaUrl = `data:application/pdf;base64,${base64PDF}`;
    
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
      to: `whatsapp:${to}`,
      body: `Here is your invoice: ${fileName}`,
      mediaUrl: mediaUrl,
    });

    console.log(`Message sent to ${to} with file ${fileName}`);
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}
