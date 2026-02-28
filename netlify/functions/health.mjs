export default async () => {
  return new Response(
    JSON.stringify({
      status: 'MOURBOT server is alive 💀',
      timestamp: new Date().toISOString(),
      platform: 'Netlify Functions',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
};

export const config = {
  path: '/api/health',
};
