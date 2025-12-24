
// Browser-safe stub for Auth Route
// NextAuth is a server-side library and cannot run in this browser environment.

export async function GET(req: Request) {
  return new Response("Auth Handler Stub", { status: 200 });
}

export async function POST(req: Request) {
  return new Response("Auth Handler Stub", { status: 200 });
}
