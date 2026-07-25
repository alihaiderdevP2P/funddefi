import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { campaignData, creatorData } = await req.json();

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
      process.env.GEMINI_API_KEY.startsWith("AIza");

    // Return mock fraud detection if no valid API key
    if (!hasValidKey) {
      const mockFraudAnalysis = {
        riskLevel: creatorData?.verified ? "LOW" : "MEDIUM",
        riskScore: creatorData?.verified ? 15 : 35,
        flags: creatorData?.verified
          ? []
          : [
              {
                type: "Unverified Creator",
                severity: "MEDIUM",
                description: "Creator account is not verified",
                recommendation:
                  "Complete identity verification to build trust with backers",
              },
            ],
        overallAssessment:
          "Campaign appears legitimate. Standard precautions recommended for new creators.",
        requiresManualReview: false,
        blockedKeywords: [],
        suspiciousPatterns: [],
      };

      return Response.json({
        fraudAnalysis: mockFraudAnalysis,
        isMockResponse: true,
        note: "Add GEMINI_API_KEY to .env for advanced fraud detection",
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

    const prompt = `Analyze this crowdfunding campaign for fraud indicators and return a JSON object with this structure:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "riskScore": <number 0-100>,
  "flags": [
    {
      "type": "<string>",
      "severity": "LOW" | "MEDIUM" | "HIGH",
      "description": "<string>",
      "recommendation": "<string>"
    }
  ],
  "overallAssessment": "<string>",
  "requiresManualReview": <boolean>,
  "blockedKeywords": [<array of strings, optional>],
  "suspiciousPatterns": [<array of strings, optional>]
}

Campaign Data:
- Title: ${campaignData.title}
- Description: ${campaignData.description}
- Goal: $${campaignData.goal}
- Duration: ${campaignData.duration} days
- Category: ${campaignData.category}

Creator Data:
- Account Age: ${creatorData.accountAge || "Unknown"}
- Previous Campaigns: ${creatorData.previousCampaigns || 0}
- Verification Status: ${creatorData.verified || false}

Look for:
- Unrealistic funding goals
- Vague or misleading descriptions
- Suspicious language patterns
- Potential scam indicators
- Copyright infringement risks
- Overly aggressive marketing language

Provide detailed fraud risk assessment.`;

    const result = await model.generateContent(prompt);
    const fraudAnalysis = JSON.parse(result.response.text());

    return Response.json({ fraudAnalysis });
  } catch (error) {
    console.error("Fraud detection error:", error);
    return Response.json(
      { error: "Failed to analyze for fraud" },
      { status: 500 }
    );
  }
}
