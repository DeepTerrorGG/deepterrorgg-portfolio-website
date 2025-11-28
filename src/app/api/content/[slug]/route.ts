
import { NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase/server-init';
import { collection, query, where, getDocs } from 'firebase/firestore';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { firestore } = initializeFirebase();
    const slug = params.slug;

    if (!slug) {
      return NextResponse.json({ error: 'Content type slug is required.' }, { status: 400 });
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

    