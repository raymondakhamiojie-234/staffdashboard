import prisma from './prisma';

// Mocks or initialization for notification providers
// For production, you'd configure Resend and Twilio here.
// import { Resend } from 'resend';
// const resend = new Resend(process.env.RESEND_API_KEY);
// import twilio from 'twilio';
// const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendNotification({
  userId,
  type,
  message,
  channels = ['in-app'] // can include 'email', 'whatsapp'
}: {
  userId: number;
  type: string;
  message: string;
  channels?: string[];
}) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    // 1. In-App Notification (Database)
    if (channels.includes('in-app')) {
      await prisma.notification.create({
        data: {
          userId,
          type,
          message
        }
      });
    }

    // 2. Email Notification
    if (channels.includes('email') && user.email) {
      // Mocking email send
      console.log(`[EMAIL] To: ${user.email} | Subject: New ${type} Notification | Body: ${message}`);
      
      /* Example production implementation:
      await resend.emails.send({
        from: 'onboarding@resend.dev', // Replace with verified domain
        to: user.email,
        subject: `New Notification: ${type}`,
        html: `<p>${message}</p>`
      });
      */
    }

    // 3. WhatsApp Notification
    if (channels.includes('whatsapp') && user.phone) {
      // Mocking WhatsApp send
      console.log(`[WHATSAPP] To: ${user.phone} | Msg: ${message}`);
      
      /* Example production implementation:
      await twilioClient.messages.create({
        body: message,
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp Sandbox number
        to: `whatsapp:${user.phone}`
      });
      */
    }

  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
