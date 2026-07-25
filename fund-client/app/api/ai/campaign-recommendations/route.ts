import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to generate UUID-like IDs for mock data
function generateMockUUID(seed: number): string {
  const hex = seed.toString(16).padStart(32, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export async function POST(req: Request) {
  try {
    const { userAddress, backingHistory, preferences } = await req.json();

    const hasValidKey =
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE" &&
      process.env.GEMINI_API_KEY.startsWith("AIza");

    // Return mock recommendations if no valid API key
    if (!hasValidKey) {
      const mockRecommendations = {
        recommendations: [
          {
            campaignId: generateMockUUID(1), // 00000001-0000-0000-0000-000000000001
            title: "Solar-Powered Charging Stations",
            category: "environment",
            matchScore: 92,
            reason:
              "Aligns with your interest in sustainable technology and has strong momentum",
            estimatedInterest: "HIGH",
            tags: ["green-tech", "solar", "innovation", "urban-solutions"],
          },
          {
            campaignId: generateMockUUID(5), // 00000005-0000-0000-0000-000000000005
            title: "Quantum Computing Research Lab",
            category: "technology",
            matchScore: 85,
            reason:
              "High innovation factor and strong backing from tech community",
            estimatedInterest: "HIGH",
            tags: ["research", "quantum", "cutting-edge", "science"],
          },
          {
            campaignId: generateMockUUID(3), // 00000003-0000-0000-0000-000000000003
            title: "AI Health Monitoring Wearable",
            category: "health",
            matchScore: 78,
            reason:
              "Strong market demand and practical application of AI technology",
            estimatedInterest: "MEDIUM",
            tags: ["health", "ai", "wearable", "wellness"],
          },
        ],
        userProfile: {
          interests: ["technology", "innovation", "sustainability"],
          backingHistory: "Limited history - exploring new opportunities",
          preferredCategories: ["technology", "environment", "health"],
          riskTolerance: "MEDIUM",
        },
        insights: [
          "You tend to support innovative technology projects",
          "Environmental campaigns align well with your interests",
          "Consider diversifying across different risk levels",
        ],
      };

      return Response.json({
        recommendations: mockRecommendations,
        isMockResponse: true,
        note: "Add GEMINI_API_KEY to .env for personalized AI recommendations",
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

    const prompt = `Generate personalized campaign recommendations and return a JSON object with this structure:
{
  "recommendations": [
    {
      "campaignId": "<uuid>", // Must be a valid UUID format (e.g., "00000001-0000-0000-0000-000000000001")
      "title": "<string>",
      "category": "<string>",
      "matchScore": <number 0-100>,
      "reason": "<string>",
      "estimatedInterest": "LOW" | "MEDIUM" | "HIGH",
      "tags": [<array of strings>]
    }
  ],
  "userProfile": {
    "interests": [<array of strings>],
    "backingHistory": "<string>",
    "preferredCategories": [<array of strings>],
    "riskTolerance": "LOW" | "MEDIUM" | "HIGH"
  },
  "insights": [<array of strings>]
}

IMPORTANT: campaignId MUST be a valid UUID format (e.g., "00000001-0000-0000-0000-000000000001"). DO NOT use "string", numeric values like "1" or "2", or any placeholder value. Use the exact UUID format provided below.

User Information:
- User Address: ${userAddress}
- Backing History: ${JSON.stringify(backingHistory)}
- Preferences: ${JSON.stringify(preferences)}

Available Campaigns (use their exact UUID IDs):
1. ID: "00000001-0000-0000-0000-000000000001" - Solar-Powered Charging Stations - Technology/Environment - $32,500/$50,000 - 65% funded
2. ID: "00000002-0000-0000-0000-000000000002" - VR Metaverse Platform - Technology - $78,300/$100,000 - 78% funded  
3. ID: "00000003-0000-0000-0000-000000000003" - AI Health Monitoring Wearable - Health - $45,200/$75,000 - 60% funded
4. ID: "00000004-0000-0000-0000-000000000004" - Ocean Cleanup Drone Fleet - Environment - $89,500/$120,000 - 75% funded
5. ID: "00000005-0000-0000-0000-000000000005" - Quantum Computing Research Lab - Technology - $156,800/$200,000 - 78% funded

Provide personalized recommendations based on:
- User's previous backing patterns
- Category preferences
- Risk tolerance
- Success probability of campaigns
- Innovation factor

Include match scores and detailed reasoning for each recommendation. Remember: campaignId MUST be one of the UUIDs listed above (e.g., "00000001-0000-0000-0000-000000000001") - never "string", numeric values, or any other format.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const recommendations = JSON.parse(responseText);

      // Validate and sanitize campaign IDs - must be UUID format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const validMockCampaignIds = [
        generateMockUUID(1),
        generateMockUUID(2),
        generateMockUUID(3),
        generateMockUUID(4),
        generateMockUUID(5),
      ];
      if (recommendations.recommendations) {
        recommendations.recommendations = recommendations.recommendations
          .map((rec: any) => {
            // Validate UUID format
            if (
              !rec.campaignId ||
              rec.campaignId === "string" ||
              !uuidRegex.test(rec.campaignId)
            ) {
              // If not a valid UUID, check if it's a numeric ID and convert it
              const numericId = parseInt(rec.campaignId);
              if (!isNaN(numericId) && numericId >= 1 && numericId <= 5) {
                rec.campaignId = generateMockUUID(numericId);
              } else {
                // Use first valid campaign ID as fallback
                rec.campaignId = validMockCampaignIds[0];
              }
            }
            return rec;
          })
          .filter((rec: any) => {
            // Only keep recommendations with valid UUID format
            return uuidRegex.test(rec.campaignId);
          });
      }

      return Response.json({ recommendations });
    } catch (apiError: any) {
      // If Gemini API fails, fall back to mock data
      console.warn("Gemini API error, falling back to mock data:", apiError);

      const mockRecommendations = {
        recommendations: [
          {
            campaignId: generateMockUUID(1),
            title: "Solar-Powered Charging Stations",
            category: "environment",
            matchScore: 92,
            reason:
              "Aligns with your interest in sustainable technology and has strong momentum",
            estimatedInterest: "HIGH",
            tags: ["green-tech", "solar", "innovation", "urban-solutions"],
          },
          {
            campaignId: generateMockUUID(5),
            title: "Quantum Computing Research Lab",
            category: "technology",
            matchScore: 85,
            reason:
              "High innovation factor and strong backing from tech community",
            estimatedInterest: "HIGH",
            tags: ["research", "quantum", "cutting-edge", "science"],
          },
          {
            campaignId: generateMockUUID(3),
            title: "AI Health Monitoring Wearable",
            category: "health",
            matchScore: 78,
            reason:
              "Strong market demand and practical application of AI technology",
            estimatedInterest: "MEDIUM",
            tags: ["health", "ai", "wearable", "wellness"],
          },
        ],
        userProfile: {
          interests: ["technology", "innovation", "sustainability"],
          backingHistory: "Limited history - exploring new opportunities",
          preferredCategories: ["technology", "environment", "health"],
          riskTolerance: "MEDIUM",
        },
        insights: [
          "You tend to support innovative technology projects",
          "Environmental campaigns align well with your interests",
          "Consider diversifying across different risk levels",
        ],
      };

      return Response.json({
        recommendations: mockRecommendations,
        isMockResponse: true,
        note: "AI API unavailable, showing mock recommendations",
      });
    }
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return Response.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
