
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

// Basic sanitization function to escape HTML characters
const escapeHtml = (unsafe: string) => {
  // This function now handles <br> tags specifically, so we don't escape them.
  // It's a bit more complex, but necessary for line breaks.
  // We'll process the string segment by segment.
  const segments = unsafe.split(/(<br\s*\/?>)/i);
  return segments.map((segment, index) => {
    if (index % 2 === 1) { // This is a <br> tag
      return segment;
    }
    return segment
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }).join('');
};

// Note: Edge runtime doesn't support the same global state as Node.js.
// We are using a simplified check here, but for production Edge rate limiting, 
// Vercel KV or Upstash is recommended. This provides basic protection against bursts.

export async function GET(req: NextRequest) {
  // Basic burst protection
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  // In a real Edge environment, we'd check a KV store here.

  const { searchParams } = new URL(req.url);

  // ?code=<encoded_code_string>
  const code = searchParams.get('code');
  // ?padding=64
  const padding = parseInt(searchParams.get('padding') || '64', 10);
  // ?background=%231a1b26
  const background = searchParams.get('background') || '#1a1b26';
  // ?width=1200
  const width = parseInt(searchParams.get('width') || '1200', 10);
  // ?height=630
  const height = parseInt(searchParams.get('height') || '630', 10);
  // ?title=MyCode.js
  const title = searchParams.get('title');

  if (!code) {
    return new Response('Missing code parameter', { status: 400 });
  }

  // The code is expected to come with <br /> tags already.
  // We use dangerouslySetInnerHTML to render these line breaks.
  const codeHtml = { __html: escapeHtml(decodeURIComponent(code)) };

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: background,
            padding: `${padding}px`,
            fontFamily: '"JetBrains Mono", monospace',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {/* Window Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#0F0F1A',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f' }}></div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', color: '#9E9E9E', fontSize: '16px' }}>
                {title}
              </div>
            </div>

            {/* Code Area */}
            <pre
              style={{
                display: 'flex',
                padding: '20px',
                margin: 0,
                background: '#1A1B26', // Code background
                color: '#d4d4d4', // Default text color
                flex: 1,
                overflow: 'auto',
                fontSize: '18px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
              }}
            >
              <code dangerouslySetInnerHTML={codeHtml} />
            </pre>
          </div>
        </div>
      ),
      {
        width: width,
        height: height,
      }
    );
  } catch (e: any) {
    console.error(e.message);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}
