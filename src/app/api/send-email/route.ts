
// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { DirectMessageSchemaType } from '@/app/contact/schema';
import { DirectMessageSchema, type DirectMessageFormState } from '@/app/contact/schema';

const resendApiKey = process.env.RESEND_API_KEY;
const designatedRecipientEmail = process.env.DESIGNATED_RECIPIENT_EMAIL;
const fromEmail = process.env.RESEND_FROM_EMAIL;

// Server-side logging for debugging purposes
console.log("--- Email API Endpoint Initialized ---");
console.log("Found RESEND_API_KEY:", !!resendApiKey);
console.log("Found DESIGNATED_RECIPIENT_EMAIL:", !!designatedRecipientEmail);
console.log("Found RESEND_FROM_EMAIL:", !!fromEmail);
if (resendApiKey) {
  console.log("RESEND_API_KEY starts with:", resendApiKey.substring(0, 5) + "...");
}

const isResendConfigValid = resendApiKey && resendApiKey.startsWith('re_');

import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 Hour
  uniqueTokenPerInterval: 500, // Max 500 users per hour
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await limiter.check(2, ip as string); // 2 requests per hour
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again in an hour.' },
      { status: 429 }
    );
  }

  console.log("--- Received New Email Request ---");

  // Enhanced check for all required environment variables
  if (!isResendConfigValid || !designatedRecipientEmail || !fromEmail) {
    const errorMessages = [];
    if (!isResendConfigValid) errorMessages.push("Resend API key is missing or invalid (must start with 're_').");
    if (!designatedRecipientEmail) errorMessages.push("Designated recipient email is not set.");
    if (!fromEmail) errorMessages.push("Resend 'from' email is not set.");

    const errorMessage = `Email service configuration is incomplete: ${errorMessages.join(' ')} Please check the environment variables.`;
    console.error("Configuration Error:", errorMessage);

    return NextResponse.json(
      {
        success: false,
        message: 'Email service is currently unavailable due to a configuration issue on the server.',
        errors: { _form: [errorMessage] },
      },
      { status: 500 }
    );
  }

  const resend = new Resend(resendApiKey);

  let data: DirectMessageSchemaType;
  try {
    data = await request.json();
  } catch (error) {
    console.error('Failed to parse request JSON:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid request format. Expected JSON.', errors: { _form: ['Invalid request format.'] } },
      { status: 400 }
    );
  }

  const validation = DirectMessageSchema.safeParse(data);
  if (!validation.success) {
    const formErrors = validation.error.flatten().fieldErrors as DirectMessageFormState['errors'];
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid form data. Please check your input.',
        errors: formErrors,
      },
      { status: 400 }
    );
  }

  const { email: senderEmail, message } = validation.data;

  try {
    const { data: resendData, error } = await resend.emails.send({
      from: `DeepTerrorGG Portfolio <${fromEmail}>`,
      to: [designatedRecipientEmail],
      subject: 'New Message from Portfolio Contact Form',
      reply_to: senderEmail,
      html: `<p>You received a new message from <strong>${senderEmail}</strong>:</p><pre style="white-space: pre-wrap; font-family: sans-serif; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">${message}</pre>`,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return NextResponse.json(
        {
          success: false,
          message: `Failed to send message: ${error.message}`,
          errors: { _form: [`API Error: ${error.message}`] },
        },
        { status: 500 }
      );
    }

    console.log('Message sent successfully via Resend:', resendData?.id);
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.',
    });

  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected Error sending email:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
        errors: { _form: [`Unexpected Error: ${error.message}`] },
      },
      { status: 500 }
    );
  }
}
