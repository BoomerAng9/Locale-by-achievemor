
// Browser-safe stub for Stripe API Route
// The original file imports 'stripe' (Node.js SDK) which crashes in browser environments.

export async function POST(req: Request) {
  // Return 404 so the client-side fallback logic in BookingsPage.tsx takes over.
  return new Response(JSON.stringify({ error: "API not available in browser demo" }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}
