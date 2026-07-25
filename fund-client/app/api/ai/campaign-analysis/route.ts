import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { title, description, goal, category, duration } = await req.json();

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
      process.env.GEMINI_API_KEY.startsWith("AIza");

    // Return mock analysis if no valid API key
    if (!hasValidKey) {
      const mockAnalysis = {
        riskScore: goal > 100000 ? 45 : 25,
        riskFactors: [
          goal > 100000
            ? "High funding goal may reduce success probability"
            : "Moderate funding goal is achievable",
          duration < 30 ? "Short campaign duration" : "Good campaign duration",
          "Consider adding more detailed milestones",
        ],
        successProbability: goal < 50000 ? 75 : goal < 100000 ? 60 : 45,
        recommendations: [
          "Add high-quality images and videos to your campaign",
          "Create engaging reward tiers at multiple price points",
          "Build a social media presence before launching",
          "Engage with your backers regularly through updates",
          "Set realistic funding goals based on market research",
        ],
        category: category || "technology",
        targetAudience: "Tech-savvy early adopters and innovation enthusiasts",
        fundingGoalAssessment: {
          isRealistic: goal < 100000,
          suggestedRange: `$${Math.floor(goal * 0.7)}-$${Math.floor(
            goal * 1.2
          )}`,
          reasoning:
            goal > 100000
              ? "Consider starting with a lower goal to build credibility"
              : "Your funding goal aligns well with similar successful campaigns",
        },
        marketAnalysis: {
          competitorCount: "5-10 similar campaigns currently active",
          marketDemand: "Medium to High",
          uniqueSellingPoints: [
            "Blockchain transparency",
            "Smart contract automation",
            "AI-powered insights",
          ],
        },
      };

      return Response.json({
        analysis: mockAnalysis,
        isMockResponse: true,
        note: "Add GEMINI_API_KEY to .env for real AI analysis",
      });
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `Analyze this crowdfunding campaign and return a JSON object with the following structure:
{
  "riskScore": <number 0-100>,
  "riskFactors": [<array of strings>],
  "successProbability": <number 0-100>,
  "recommendations": [<array of strings>],
  "category": "<string>",
  "targetAudience": "<string>",
  "fundingGoalAssessment": {
    "isRealistic": <boolean>,
    "suggestedRange": "<string>",
    "reasoning": "<string>"
  },
  "marketAnalysis": {
    "competitorCount": "<string>",
    "marketDemand": "<string>",
    "uniqueSellingPoints": [<array of strings>]
  }
}

Campaign Details:
- Title: ${title}
- Description: ${description}
- Funding Goal: $${goal}
- Category: ${category}
- Duration: ${duration} days

Provide a comprehensive analysis including risk factors, success probability, and actionable recommendations.`;

    const result = await model.generateContent(prompt);
    const analysis = JSON.parse(result.response.text());

    return Response.json({ analysis });
  } catch (error) {
    console.error("Campaign analysis error:", error);
    return Response.json(
      { error: "Failed to analyze campaign" },
      { status: 500 }
    );
  }
}
