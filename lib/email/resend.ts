
// Mock Resend for client-side environment
// In a production app, email logic must reside in a secure backend environment (Node.js/Edge).

export async function sendLocaleEmail(userId: string, templateKey: string) {
  console.log(`[Mock Email Service] Dispatching email to user: ${userId} using template: ${templateKey}`);
  console.log(`[Mock Email Service] This would normally use Resend SDK server-side.`);
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 600));
  
  return { success: true, id: 'mock_email_id_' + Date.now() };
}
