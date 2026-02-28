const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'n4lKrr2zZPszjxVKnVTvZawjHkruCjId';

export async function searchGif(query) {
  try {
    const url = `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=pg-13`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      return data.data[0].images.fixed_height.url;
    }
    return null;
  } catch {
    return null;
  }
}
