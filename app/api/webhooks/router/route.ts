
// Browser-safe stub for Webhook Router
// The original file imports lib/webhooks which may contain server code.

export async function POST(req: Request) {
  return new Response(JSON.stringify({ message: "Webhook simulator ready" }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
