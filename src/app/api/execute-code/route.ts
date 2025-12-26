
import { NextResponse } from 'next/server';

import { rateLimit } from '@/lib/rate-limit';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 Minute
  uniqueTokenPerInterval: 500,
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    await limiter.check(10, ip as string); // 10 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }
  try {
    const { language, code } = await request.json();

    if (!language || typeof code !== 'string') {
      return NextResponse.json({ error: 'Language and code are required.' }, { status: 400 });
    }

    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: language,
        version: '*', // Use the latest version of the language
        files: [
          {
            name: `main`, // Filename doesn't need extension
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: `Piston API Error: ${errorData.message || 'Failed to execute code.'}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    // Combine stdout and stderr for a comprehensive output
    const output = `${result.run.stdout || ''}${result.run.stderr || ''}`.trim();
    const finalOutput = output === '' ? 'Code executed successfully with no console output.' : output;


    return NextResponse.json({ output: finalOutput });

  } catch (error: any) {
    console.error('Execute Code API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
