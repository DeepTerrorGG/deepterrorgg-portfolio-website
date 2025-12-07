
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, query, where, getDocs } from 'firebase/firestore';

// Simple sanitization: allow only alphanumeric characters, hyphens, and underscores.
const sanitizeSlug = (slug: string) => {
  return slug.replace(/[^a-zA-Z0-9-_]/g, '');
};

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { firestore } = initializeFirebase();
    const rawSlug = params.slug;

    if (!rawSlug) {
      return NextResponse.json({ error: 'Content type slug is required.' }, { status: 400 });
    }
    
    // Sanitize the slug before using it in the query
    const slug = sanitizeSlug(rawSlug);
    if (slug !== rawSlug) {
        // If sanitization changed the slug, it might be a sign of a malicious attempt.
        // We can choose to block it or proceed with the sanitized version.
        // For this portfolio, proceeding with the sanitized slug is safe enough.
        console.warn(`Original slug "${rawSlug}" was sanitized to "${slug}".`);
    }
    

    const entriesQuery = query(collection(firestore, 'content_entries'), where('slug', '==', slug));
    const querySnapshot = await getDocs(entriesQuery);

    if (querySnapshot.empty) {
      return NextResponse.json([]);
    }

    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data().fields,
      _meta: {
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
      }
    }));
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch content.' }, { status: 500 });
  }
}
