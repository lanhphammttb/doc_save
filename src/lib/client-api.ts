export async function getDocument(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/documents/${id}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to fetch document');
    }

    return res.json();
  } catch (error) {
    console.error('Error in getDocument:', error);
    throw error;
  }
}