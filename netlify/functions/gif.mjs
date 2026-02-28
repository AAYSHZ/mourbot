export default async (req) => {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify({ error: 'query parameter q is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const apiKey = process.env.GIPHY_API_KEY || 'n4lKrr2zZPszjxVKnVTvZawjHkruCjId';
    const giphyUrl = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1&rating=pg-13`;
    const res = await fetch(giphyUrl);
    const data = await res.json();

    const gifUrl = data.data?.[0]?.images?.fixed_height?.url || null;
    return new Response(JSON.stringify({ url: gifUrl }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ url: null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = {
  path: '/api/gif',
};
