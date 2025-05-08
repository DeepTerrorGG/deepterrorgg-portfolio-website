// src/app/api/send-email/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { DirectMessageSchemaType } from '@/app/contact/schema'; 
import { DirectMessageSchema, type DirectMessageFormState } from '@/app/contact/schema'; 

// --- Rate Limiting ---
interface EmailRateLimitEntry {
  count: number;
  timestamp: number; // Timestamp of the first email in the current 24-hour window
}

const emailRateLimits: Record<string, EmailRateLimitEntry> = {};
const MAX_EMAILS_PER_DAY = 3;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// --- SMTP Configuration ---
const smtpHost = process.env.SMTP_HOST;
const smtpPortString = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpSecureString = process.env.SMTP_SECURE; 

// Email addresses
const smtpFromEmail = process.env.SMTP_FROM_EMAIL; 
const designatedRecipientEmail = process.env.DESIGNATED_RECIPIENT_EMAIL || 'daniloiliccc@gmail.com';

let smtpPort: number | undefined;
if (smtpPortString) {
  const parsedPort = parseInt(smtpPortString, 10);
  if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
    smtpPort = parsedPort;
  }
}

const smtpSecure = smtpSecureString === 'true';

const missingEnvVars: string[] = [];
if (!smtpHost) missingEnvVars.push('SMTP_HOST');
if (!smtpPortString) missingEnvVars.push('SMTP_PORT (e.g., 587 or 465)');
else if (smtpPort === undefined && smtpPortString) missingEnvVars.push('SMTP_PORT (must be a valid number)');
if (!smtpUser) missingEnvVars.push('SMTP_USER (your SMTP username)');
if (!smtpPass) missingEnvVars.push('SMTP_PASS (your SMTP password)');
if (!smtpFromEmail) missingEnvVars.push('SMTP_FROM_EMAIL (a verified sender email address)');
if (smtpSecureString === undefined) missingEnvVars.push('SMTP_SECURE (true for SSL/TLS on port 465, false for STARTTLS on port 587)');


const placeholderIssues: string[] = [];
if (smtpHost === 'your_smtp_host' || smtpHost === 'smtp.example.com') placeholderIssues.push('SMTP_HOST is still set to a placeholder value.');
if (smtpUser === 'your_smtp_username' || smtpUser === 'YOUR_GMAIL_ADDRESS@gmail.com') {
    // Allow deepterrorgg.portfolio@gmail.com as it was explicitly set
    if (smtpUser !== 'deepterrorgg.portfolio@gmail.com') {
      placeholderIssues.push('SMTP_USER is still set to a placeholder value.');
    }
}
if (smtpPass === 'your_smtp_password' || smtpPass === 'YOUR_GMAIL_APP_PASSWORD') {
    // Allow bmeu bbfs oqmz mvyc as it was explicitly set
     if (smtpPass !== 'bmeu bbfs oqmz mvyc') {
        placeholderIssues.push('SMTP_PASS is still set to a placeholder value.');
     }
}
if (smtpFromEmail === 'you@yourdomain.com' || smtpFromEmail === 'YOUR_GMAIL_ADDRESS@gmail.com') {
    // Allow deepterrorgg.portfolio@gmail.com as it was explicitly set
    if (smtpFromEmail !== 'deepterrorgg.portfolio@gmail.com') {
       placeholderIssues.push('SMTP_FROM_EMAIL is still set to a placeholder value (this must be your actual Gmail address used for SMTP_USER or a verified domain sender).');
    }
}


const isSmtpConfigComplete = missingEnvVars.length === 0;
const hasNoPlaceholders = placeholderIssues.length === 0;
const isSmtpConfigValid = isSmtpConfigComplete && hasNoPlaceholders;

if (!process.env.DESIGNATED_RECIPIENT_EMAIL && designatedRecipientEmail === 'daniloiliccc@gmail.com') {
  console.warn("DESIGNATED_RECIPIENT_EMAIL is not set, defaulting to 'daniloiliccc@gmail.com'. Consider setting it explicitly in your .env.local file.");
}


export async function POST(request: Request) {
  if (!isSmtpConfigValid) {
    const allIssues: string[] = [];
    if (!isSmtpConfigComplete) {
        allIssues.push(`The following required SMTP environment variables are missing: ${missingEnvVars.join(', ')}.`);
    }
    if (!hasNoPlaceholders) {
        allIssues.push(`The following SMTP environment variables are still using placeholder values: ${placeholderIssues.join('; ')}.`);
    }
    const detailMessage = allIssues.join(' Please update your .env.local file or server environment settings.');
    const errorMessage = `SMTP server configuration is incomplete or uses placeholder values. ${detailMessage}`;
    console.error("Configuration Error:", errorMessage);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Email service is currently unavailable due to a configuration issue. Please contact the site administrator.',
        errors: { _form: [`SMTP server configuration error. ${detailMessage}`] },
      },
      { status: 500 }
    );
  }

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

  // --- Rate Limiting Check ---
  const now = Date.now();
  let userRateLimit = emailRateLimits[senderEmail];

  if (userRateLimit && (now - userRateLimit.timestamp > ONE_DAY_IN_MS)) {
    // Reset if the 24-hour window has passed
    delete emailRateLimits[senderEmail];
    userRateLimit = undefined;
  }

  if (!userRateLimit) {
    emailRateLimits[senderEmail] = { count: 0, timestamp: now };
    userRateLimit = emailRateLimits[senderEmail];
  }

  if (userRateLimit.count >= MAX_EMAILS_PER_DAY) {
    console.warn(`Rate limit exceeded for ${senderEmail}`);
    return NextResponse.json(
      {
        success: false,
        message: 'You have reached the maximum number of messages for today. Please try again tomorrow.',
        errors: { _form: ['Rate limit exceeded. Please try again later.'] },
      },
      { status: 429 } // Too Many Requests
    );
  }
  // --- End Rate Limiting Check ---


  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure, 
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000, 
    debug: process.env.NODE_ENV === 'development', 
    logger: process.env.NODE_ENV === 'development',
  });

  try {
    const mailOptions = {
      from: `DeepTerrorGG Portfolio <${smtpFromEmail}>`,
      to: designatedRecipientEmail,
      replyTo: senderEmail,
      subject: 'New Message from Portfolio Contact Form',
      html: `
        <p>You received a new message from <strong>${senderEmail}</strong>:</p>
        <pre style="white-space: pre-wrap; font-family: sans-serif; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">${message}</pre>
      `,
    };

    console.log("Attempting to send email with options (auth details omitted):", { ...mailOptions, auth: undefined });
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    if (nodemailer.getTestMessageUrl(info)) {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    // Increment rate limit count on successful send
    emailRateLimits[senderEmail].count++;
    
    return NextResponse.json({
      success: true,
      message: 'Your message has been sent successfully! I will get back to you soon.',
    });

  } catch (err: unknown) {
    const error = err as Error & { code?: string; command?: string, responseCode?: number, response?: string };
    console.error('Nodemailer Error Details:', error); 
    
    let userMessage = 'Failed to send message. Please try again later.';
    if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT' || error.code === 'EDNS') {
      userMessage = `Could not connect to the email server (host: '${smtpHost}', port: ${smtpPort}). Please double-check your SMTP settings and ensure the server is reachable. (Error: ${error.code})`;
    } else if (error.code === 'EAUTH' || (error.responseCode && [534, 535, 537].includes(error.responseCode)) || error.message.toLowerCase().includes('invalid login') || error.message.toLowerCase().includes('authentication failed') || error.message.toLowerCase().includes('username and password not accepted')) {
      userMessage = `Email server authentication failed (SMTP User: '${smtpUser}'). Please check your SMTP_USER/SMTP_PASS. For Gmail, ensure you are using an App Password if 2-Step Verification is enabled. (Error: ${error.code || error.responseCode})`;
    } else if ((error.responseCode === 550 || error.responseCode === 554) && error.message.toLowerCase().includes('sender address rejected')) {
        userMessage = `Email rejected by the server (Code: ${error.responseCode}). The sender email address '${smtpFromEmail}' might not be authorized by the SMTP server or is invalid. Contact administrator.`;
    } else if (error.responseCode === 550 || error.responseCode === 554) {
        userMessage = `Email rejected by the server (Code: ${error.responseCode}). This might be due to sender/recipient policy (e.g., SMTP_FROM_EMAIL '${smtpFromEmail}' might not be authorized or the recipient address '${designatedRecipientEmail}' is invalid/blocked). Contact administrator.`;
    } else if (error.code === 'EENVELOPE' && error.message.includes('Missing credentials for "PLAIN"')) {
      userMessage = 'SMTP authentication credentials (SMTP_USER, SMTP_PASS) seem to be missing or incorrect. Contact administrator.';
    } else if (error.message.includes('Recipient address rejected')) {
      userMessage = `The recipient address '${designatedRecipientEmail}' was rejected by the server. Please check if it's valid.`;
    } else if (error.code === 'ESOCKET' && error.message.includes('wrong version number')) {
      userMessage = `There was an SSL/TLS version mismatch with the SMTP server (host: '${smtpHost}', port: ${smtpPort}, secure: ${smtpSecure}). Try toggling SMTP_SECURE or check port. (Error: ${error.code})`;
    }
    
    return NextResponse.json(
      {
        success: false,
        message: userMessage,
        errors: { _form: [userMessage, `Nodemailer Error: ${error.message} (Code: ${error.code || 'N/A'})`] },
      },
      { status: 500 }
    );
  }
}
