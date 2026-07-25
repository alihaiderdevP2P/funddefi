import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json();

    // Check if Gemini API key is configured
    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
      process.env.GEMINI_API_KEY.startsWith("AIza");

    // If no valid API key, return helpful mock response
    if (!hasValidKey) {
      const mockResponses = {
        hi: `Hello! Welcome to FundFlow! 👋\n\nI'm your AI assistant here to help with our blockchain crowdfunding platform. How can I assist you today?`,
        hello: `Hello! Welcome to FundFlow! 👋\n\nI'm your AI assistant here to help with our blockchain crowdfunding platform. How can I assist you today?`,
        hey: `Hey there! 👋\n\nI'm your FundFlow AI assistant. What can I help you with?`,
        "are you ok": `Yes, I'm doing great! Ready to help. What would you like to know?`,
        "are you okay": `Yes, I'm doing great! Ready to help. What would you like to know?`,
        "how are you": `I'm doing great, thanks for asking! How can I help you with FundFlow?`,
        good: `Glad to hear it! How can I help you with FundFlow today?`,
        "that's good": `Great! What would you like to do on FundFlow?`,
        "that is good": `Great! What would you like to do on FundFlow?`,
        thanks: `You're welcome! Anything else I can help with?`,
        "thank you": `You're welcome! Anything else I can help with?`,
        thank: `You're welcome! Anything else I can help with?`,
        ok: `Got it! What would you like to know?`,
        okay: `Got it! What would you like to know?`,
        "how do i create a campaign":
          "To create a campaign on FundFlow:\n\n1. Click 'Launch Campaign' or visit /create\n\n2. Fill in your campaign details (title, description, funding goal)\n\n3. Add rewards for your backers (optional)\n\n4. Connect your wallet to deploy the smart contract\n\n5. Submit and share your campaign!\n\nNeed more help? Check out our detailed guide at /how-it-works",
        "what is fundflow":
          "FundFlow is a blockchain-based crowdfunding platform that combines the transparency of blockchain technology with AI-powered features. We help creators raise funds for innovative projects while giving backers confidence through smart contracts and fraud detection.",
        "how does wallet work":
          "Your wallet (like MetaMask) is your secure gateway to blockchain. It stores your cryptocurrency and signs transactions. To connect: Click 'Connect Wallet' in the top navigation, approve the connection, and you're ready to back campaigns or create your own!",
        default: `I'm here to help with FundFlow! I can assist you with:\n\n1. Creating and managing campaigns\n\n2. Understanding blockchain crowdfunding\n\n3. Platform features and how to use them\n\n4. Wallet connection and transactions\n\n5. Finding campaigns to support\n\nWhat would you like to know?\n\n💡 Tip: For full AI features, add your GEMINI_API_KEY to the .env file!`,
      };

      const lowerMessage = message.toLowerCase().trim();
      let response = mockResponses.default;

      // Check for simple conversational responses first
      const simpleResponses = [
        "are you ok",
        "are you okay",
        "how are you",
        "good",
        "that's good",
        "that is good",
        "thanks",
        "thank you",
        "thank",
        "ok",
        "okay",
        "fine",
        "cool",
        "nice",
        "alright",
        "sure",
      ];

      // Check if message is a simple conversational response
      const isSimpleResponse = simpleResponses.some((pattern) =>
        lowerMessage.includes(pattern)
      );

      if (isSimpleResponse) {
        // Find matching response
        for (const [key, value] of Object.entries(mockResponses)) {
          if (lowerMessage.includes(key) && key !== "default") {
            response = value;
            break;
          }
        }
        // If no specific match found, use a simple friendly response
        if (response === mockResponses.default) {
          response = `Great! How can I help you with FundFlow today?`;
        }
      } else {
        // Check for greetings (exact match or starts with)
        const greetings = ["hi", "hello", "hey"];
        const isGreeting = greetings.some(
          (greeting) =>
            lowerMessage === greeting ||
            lowerMessage.startsWith(greeting + " ") ||
            lowerMessage.startsWith(greeting + ",") ||
            lowerMessage.startsWith(greeting + "!")
        );

        if (isGreeting) {
          response =
            mockResponses[
              lowerMessage.split(/[\s,!]/)[0] as keyof typeof mockResponses
            ] || mockResponses.hi;
        } else {
          // Check other patterns
          for (const [key, value] of Object.entries(mockResponses)) {
            if (
              key !== "default" &&
              !greetings.includes(key) &&
              !simpleResponses.includes(key) &&
              lowerMessage.includes(key)
            ) {
              response = value;
              break;
            }
          }
        }
      }

      return Response.json({
        response,
        isMockResponse: true,
        note: "Add GEMINI_API_KEY to .env for full AI features",
      });
    }

    // Build context from conversation history
    const context =
      conversationHistory
        ?.map(
          (msg: any) =>
            `${msg.type === "user" ? "User" : "Assistant"}: ${msg.content}`
        )
        .join("\n") || "";

    const prompt = `You are an AI assistant for FundFlow, a blockchain-based crowdfunding platform. You help users with:

1. Campaign creation and optimization
2. Understanding blockchain technology in crowdfunding
3. Platform features and functionality
4. Best practices for successful campaigns
5. Finding and backing campaigns
6. Technical support and guidance

Context from previous conversation:
${context}

Current user message: ${message}

IMPORTANT FORMATTING RULES:
- Always use numbered lists (1, 2, 3, etc.) instead of bullet points for step-by-step instructions or multiple options
- Each numbered item MUST be on its own separate line with a blank line before the next numbered item
- Format lists like this (with blank lines between each item):
  1. First step or option

  2. Second step or option

  3. Third step or option
- Use clear, step-by-step instructions when explaining processes
- Make responses easy to understand and follow
- NEVER put two numbered items on the same line - each number must start on a new line

GREETING AND CONVERSATION HANDLING:
- When users greet you (hi, hello, hey, etc.), respond warmly with a SHORT introduction
- For FIRST greeting only, you can mention what you help with, but keep it brief (1-2 sentences max)
- For simple conversational responses (like "good", "are you ok", "thanks"), give SHORT, natural responses without repeating the full menu
- DO NOT mention "Gemini" or "Google" - you are a FundFlow assistant
- DO NOT repeat the full list of options unless the user specifically asks what you can do
- If the user already greeted you earlier in the conversation, just respond naturally without repeating your full introduction

Examples:
- First "hi": "Hello! Welcome to FundFlow! 👋 I'm here to help with our blockchain crowdfunding platform. How can I assist you?"
- Follow-up "are you ok": "Yes, I'm doing great! Ready to help. What would you like to know?"
- Follow-up "good": "Great! How can I help you with FundFlow today?"
- Follow-up "thanks": "You're welcome! Is there anything else I can help with?"

Provide a helpful, accurate, and friendly response. Keep responses concise and natural. Match the user's tone - if they're being casual, be casual back. Don't repeat yourself or give long lists unless the user specifically asks for help or information.

IMPORTANT: 
- Keep responses SHORT and CONVERSATIONAL for simple messages
- Only provide detailed numbered lists when the user asks "what can you do" or requests specific help
- For simple acknowledgments like "good", "ok", "thanks" - just respond naturally (1-2 sentences max)
- If the user already greeted you in this conversation, don't repeat your introduction

If you don't know something specific about FundFlow, acknowledge it and offer to help with what you can.

Key FundFlow features to mention when relevant:
1. Blockchain-based transparency
2. Smart contract automation
3. AI-powered campaign analysis
4. Global accessibility
5. Lower fees than traditional platforms
6. Real-time funding updates
7. Fraud detection
8. Campaign recommendations

When suggesting multiple options or actions, always format them as a numbered list (1, 2, 3...) with each number on its own separate line. Put a blank line between each numbered item so they don't run together.

Remember: You are a FundFlow assistant, not a generic AI. Always stay focused on FundFlow platform features and services.

Respond in a conversational, helpful tone with proper formatting.`;

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ response: text });
  } catch (error) {
    console.error("Chat assistant error:", error);
    return Response.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
