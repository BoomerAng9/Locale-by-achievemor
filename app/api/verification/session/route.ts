
// Browser-safe stub for Verification API Route

export async function POST(req: Request) {
  return new Response(JSON.stringify({ error: "API not available in browser demo" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
