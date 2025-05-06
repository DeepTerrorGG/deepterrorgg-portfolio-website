// src/app/contact/actions/sendDirectMessageAction.ts
'use server';

import { Resend } from 'resend';
import type { DirectMessageSchemaType, DirectMessageFormState } from '../schema';
import { DirectMessageSchema } from '../schema';

const resendApiKey = process.env.RESEND_API_KEY;
const designatedRecipientEmail = 'daniloiliccc@gmail.com'; 

let resend: Resend | null = null;
let resendInitializationError: string | null = null;

if (resendApiKey && typeof resendApiKey === 'string' && resendApiKey.startsWith('re_')) {
  try {
    resend = new Resend(resendApiKey);
  } catch (error: unknown) {
    console.error("Failed to initialize Resend with provided API key:", error);
    if (error instanceof Error) {
      resendInitializationError = `Resend SDK initialization failed: ${error.message}`;
    } else {
      resendInitializationError = 'Resend SDK initialization failed due to an unknown error.';
    }
  }
} else if (resendApiKey) {
  const invalidKeyMessage = "RESEND_API_KEY is set but invalid (must start with 're_'). Email sending will not be possible.";
  console.warn(invalidKeyMessage);
  resendInitializationError = invalidKeyMessage;
} else {
  const missingKeyMessage = "RESEND_API_KEY is not set. Email sending will not be possible. Please set this environment variable.";
  console.warn(missingKeyMessage);
  resendInitializationError = missingKeyMessage;
}

export async function sendDirectMessageAction(
  data: DirectMessageSchemaType
): Promise<DirectMessageFormState> {
  const validationResult = DirectMessageSchema.safeParse(data);

  if (!validationResult.success) {
    return {
      success: false,
      message: 'Invalid form data. Please check your inputs.',
      errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const { email, message } = validationResult.data;

  if (!resend) {
    const userMessage = 'Failed to send message. The email service is not available or not correctly configured. Please check server logs for more details or contact support if this issue persists.';
    // Provide specific error message based on initialization status.
    const internalMessage = resendInitializationError || 'Email service is not configured (Resend client is null). Ensure RESEND_API_KEY is correctly set in your environment variables.';
    
    console.error(`Cannot send email: ${internalMessage}`);
    
    return {
      success: false,
      message: userMessage,
      errors: { _form: [internalMessage] }, 
    };
  }

  try {
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', 
      to: [designatedRecipientEmail], 
      subject: 'New Message from Portfolio Contact Form',
      reply_to: email,
      html: `<p>You received a new message from: <strong>${email}</strong></p>
             <p><strong>Message:</strong></p>
             <p style="white-space: pre-wrap;">${message}</p>`,
    });

    if (emailError) {
      console.error('Resend API Error:', emailError);
      let userFriendlyMessage = 'Failed to send message due to an issue with the email service.';
      if (emailError.message) {
        if (emailError.message.includes('Invalid API Key') || emailError.message.includes('`api_key` is missing')) {
            userFriendlyMessage = 'Failed to send message: The email service API key is invalid or missing. Please verify your RESEND_API_KEY.';
        } else if (emailError.message.includes('`to` address is not valid')) {
            userFriendlyMessage = 'Failed to send message: The recipient email address is invalid.';
        } else if (emailError.message.includes('`from` address is not valid') || emailError.message.includes('sender address is not verified')) {
            userFriendlyMessage = 'Failed to send message: The sender email address is not configured correctly (e.g., domain not verified in Resend dashboard). The default "onboarding@resend.dev" can only send to your own email used for Resend account.';
        } else if (emailError.message.includes('daily quota')) {
            userFriendlyMessage = 'Failed to send message: Daily email quota reached for the Resend account.';
        }
      }
      return {
        success: false,
        message: userFriendlyMessage,
        errors: { _form: [userFriendlyMessage, `Resend Error: ${emailError.name} - ${emailError.message}`] },
      };
    }

    return {
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.',
    };
  } catch (error: unknown) {
    console.error('Unexpected error during email sending:', error);
    let errorMessageText = 'An unexpected error occurred while sending your message.';
     if (error instanceof Error) {
      errorMessageText = `An unexpected error occurred: ${error.message}`;
      if (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('authentication')) {
           errorMessageText = 'Email service authentication failed. Please review API key configuration.';
      }
    } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as {message?: unknown}).message === 'string') {
        const errMessage = (error as {message: string}).message;
        if (errMessage.toLowerCase().includes('api key') || errMessage.toLowerCase().includes('authentication')) {
             errorMessageText = 'Email service authentication failed. Please review API key configuration.';
        }
    }
    
    return {
      success: false,
      message: errorMessageText,
      errors: { _form: [errorMessageText] },
    };
  }
}
