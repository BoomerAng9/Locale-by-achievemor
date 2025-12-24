
// Browser-safe stub for LLM API Route
// The original file uses server-side fetch to GLM API.

export async function POST(req: Request) {
  return new Response(JSON.stringify({ error: "API not available in browser demo" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
