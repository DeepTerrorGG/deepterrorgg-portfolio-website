
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
  }

  try {
    // We use 'HEAD' to be efficient and not download the whole page.
    // The AbortController ensures the request times out if it takes too long.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow', // Follow redirects to get the final status
    });

    clearTimeout(timeoutId);

    // If we get any response (even a 404 or 500), the server is "up".
    // It's just the specific page that might have an issue.
    // A network error (caught by the try/catch) means the server is truly "down".
    return NextResponse.json({ isUp: true, status: response.status });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ isUp: false, error: 'Request timed out' });
    }
    // Any other error (e.g., DNS resolution failed, connection refused) means the site is down.
    return NextResponse.json({ isUp: false, error: 'Site is unreachable' });
  }
}
