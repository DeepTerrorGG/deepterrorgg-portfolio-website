
import { NextResponse } from 'next/server';

const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

export async function POST(request: Request) {
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
            name: `main.${language}`,
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
    const output = result.run.stdout || result.run.stderr || '';

    return NextResponse.json({ output });

  } catch (error: any) {
    console.error('Execute Code API Error:', error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
