import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { type, context } = await req.json();

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
      process.env.GEMINI_API_KEY.startsWith("AIza");

    // Return mock content if no valid API key
    if (!hasValidKey) {
      let mockContent = "";

      switch (type) {
        case "campaign-description":
          mockContent = `${context.title} represents an innovative solution in the ${context.category} space. Our project addresses critical challenges while delivering tangible value to our community.\n\nThe Problem:\nMany current solutions fall short in addressing the core needs of users. We've identified key pain points that demand a fresh approach.\n\nOur Solution:\nThrough cutting-edge technology and user-centric design, we're building a platform that revolutionizes how people interact with ${context.category}. Our unique approach combines innovation with practicality.\n\nWhy This Matters:\nThis project will empower users, create positive change, and set new standards in the industry. With your support, we can bring this vision to life.\n\nWhat Backers Get:\nBy supporting this campaign, you'll be part of an innovative movement. Early backers receive exclusive rewards and the satisfaction of supporting breakthrough innovation.`;
          break;

        case "campaign-title":
          mockContent = `1. ${context.description} - Revolutionary Innovation\n2. Transform the Future of ${context.category}\n3. Next-Gen Solution for Modern Challenges\n4. Empowering Change Through Technology\n5. The Ultimate ${context.category} Platform`;
          break;

        case "reward-descriptions":
          mockContent = `**$25 - Early Supporter Tier**\nThank you for believing in us! Get exclusive updates, your name on our supporter wall, and a digital thank-you package.\n\n**$50 - Enthusiast Tier**\nAll previous rewards plus early access to our beta platform, exclusive behind-the-scenes content, and a limited edition digital badge.\n\n**$100 - Innovator Tier**\nEverything above plus priority customer support, invitation to exclusive webinars, and a personalized thank-you video from our team.\n\n**$250 - Visionary Tier**\nAll previous rewards plus lifetime premium access, one-on-one consultation session, and recognition as a founding supporter on our platform.`;
          break;

        default:
          mockContent =
            "Generated content will appear here. Add your OpenAI API key for custom AI-generated content!";
      }

      return Response.json({
        content: mockContent,
        isMockResponse: true,
        note: "Add GEMINI_API_KEY to .env for custom AI content generation",
      });
    }

    let prompt = "";

    switch (type) {
      case "campaign-description":
        prompt = `Generate a compelling crowdfunding campaign description for: ${context.title}
        Category: ${context.category}
        Goal: $${context.goal}
        
        Make it engaging, professional, and include:
        - Problem statement
        - Solution overview
        - Why this project matters
        - What backers will get
        
        Keep it between 200-400 words.`;
        break;

      case "campaign-title":
        prompt = `Generate 5 compelling crowdfunding campaign titles for a ${context.category} project about: ${context.description}
        
        Make them:
        - Catchy and memorable
        - Clear about the value proposition
        - Under 60 characters each
        - Professional yet engaging`;
        break;

      case "reward-descriptions":
        prompt = `Generate reward tier descriptions for a crowdfunding campaign:
        Project: ${context.title}
        Category: ${context.category}
        
        Create 4 reward tiers at these price points: $25, $50, $100, $250
        Make each reward compelling and appropriate for the price point.`;
        break;

      default:
        return Response.json(
          { error: "Invalid content type" },
          { status: 400 }
        );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Generate response
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return Response.json({ content: text });
  } catch (error) {
    console.error("Content generation error:", error);
    return Response.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
