import { ChatMessage } from '../../types';

// In a real app, this calls the Next.js API route.
// For this preview, we simulate the API call if the backend isn't reachable.

export async function sendMessageToGLM(messages: ChatMessage[], context: string): Promise<string> {
  try {
    const response = await fetch('/api/llm/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, context }),
    });

    if (!response.ok) {
      throw new Error('API call failed');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.warn("Backend not available in preview, using mock GLM response.");
    return mockGLMResponse(messages, context);
  }
}

function mockGLMResponse(messages: ChatMessage[], context: string): string {
  const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
  
  if (context === 'calculator') {
    return "Based on your inputs, your effective hourly rate is healthy. However, I recommend setting aside 25% of your net profit for an emergency fund. Would you like tips on tax deductions for freelancers?";
  }
  
  if (lastUserMessage.includes('verify')) {
    return "Verification is a key step in moving from the 'Garage' to 'Community' stage. You can start the process by clicking the 'Verify Identity' button in your dashboard. We use Ballerine for secure document processing.";
  }

  return "Welcome to Locale by: ACHIEVEMOR. How can I help? Think It. Prompt It. Let Us Manage It.";
}