import { NextResponse } from "next/server";
import { getReachableBackendApiUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

// Helper to generate UUID-like IDs for mock data
function generateMockUUID(seed: number): string {
  const hex = seed.toString(16).padStart(32, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Mock campaigns data to display without backend (fallback)
const mockCampaigns = [
  {
    id: generateMockUUID(1), // 00000001-0000-0000-0000-000000000001
    title: "Solar-Powered Charging Stations",
    description:
      "Revolutionary solar charging stations for urban environments. Our innovative design combines cutting-edge photovoltaic technology with smart grid integration to provide sustainable energy solutions for electric vehicles and mobile devices.",
    summary:
      "Sustainable charging infrastructure for the future of urban mobility",
    goalAmount: 50.0,
    raisedAmount: 32.5,
    endDate: "2024-12-31T23:59:59.000Z",
    status: "active" as const,
    category: "environment" as const,
    imageUrl: "/solar-charging-station.jpg",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    contractAddress: "0x1111111111111111111111111111111111111111",
    backersCount: 156,
    creator: {
      id: "user1",
      email: "john@example.com",
      name: "John Doe",
      walletAddress: "0x1234567890123456789012345678901234567890",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Passionate entrepreneur and tech innovator",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-15T00:00:00.000Z",
  },
  {
    id: generateMockUUID(2), // 00000002-0000-0000-0000-000000000002
    title: "VR Metaverse Platform",
    description:
      "Next-generation virtual reality platform that creates immersive digital worlds for education, entertainment, and social interaction. Built with cutting-edge VR technology and blockchain integration.",
    summary: "Building the future of virtual reality experiences",
    goalAmount: 100.0,
    raisedAmount: 78.3,
    endDate: "2024-11-30T23:59:59.000Z",
    status: "active" as const,
    category: "technology" as const,
    imageUrl: "/virtual-reality-metaverse.png",
    videoUrl: null,
    contractAddress: "0x2222222222222222222222222222222222222222",
    backersCount: 234,
    creator: {
      id: "user2",
      email: "jane@example.com",
      name: "Jane Smith",
      walletAddress: "0x2345678901234567890123456789012345678901",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "Creative designer and sustainability advocate",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-10T00:00:00.000Z",
  },
  {
    id: generateMockUUID(3), // 00000003-0000-0000-0000-000000000003
    title: "AI Health Monitoring Wearable",
    description:
      "Advanced wearable device that uses artificial intelligence to monitor vital signs, predict health issues, and provide personalized wellness recommendations in real-time.",
    summary: "AI-powered health monitoring for everyone",
    goalAmount: 75.0,
    raisedAmount: 45.2,
    endDate: "2024-10-31T23:59:59.000Z",
    status: "active" as const,
    category: "health" as const,
    imageUrl: "/ai-health-wearable-device.jpg",
    videoUrl: null,
    contractAddress: "0x3333333333333333333333333333333333333333",
    backersCount: 189,
    creator: {
      id: "user3",
      email: "mike@example.com",
      name: "Mike Johnson",
      walletAddress: "0x3456789012345678901234567890123456789012",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Environmental scientist and clean energy researcher",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-05T00:00:00.000Z",
    updatedAt: "2024-01-05T00:00:00.000Z",
  },
  {
    id: generateMockUUID(4), // 00000004-0000-0000-0000-000000000004
    title: "Ocean Cleanup Drone Fleet",
    description:
      "Autonomous drone fleet designed to collect plastic waste from oceans using AI-powered navigation and biodegradable collection nets. Scalable solution for marine pollution.",
    summary: "Protecting our oceans with innovative cleanup technology",
    goalAmount: 120.0,
    raisedAmount: 89.5,
    endDate: "2024-12-15T23:59:59.000Z",
    status: "active" as const,
    category: "environment" as const,
    imageUrl: "/ocean-cleanup-drone.jpg",
    videoUrl: null,
    contractAddress: "0x4444444444444444444444444444444444444444",
    backersCount: 312,
    creator: {
      id: "user1",
      email: "john@example.com",
      name: "John Doe",
      walletAddress: "0x1234567890123456789012345678901234567890",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      bio: "Passionate entrepreneur and tech innovator",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-20T00:00:00.000Z",
    updatedAt: "2024-01-20T00:00:00.000Z",
  },
  {
    id: generateMockUUID(5), // 00000005-0000-0000-0000-000000000005
    title: "Quantum Computing Research Lab",
    description:
      "State-of-the-art research facility dedicated to advancing quantum computing technology for solving complex problems in medicine, climate science, and cryptography.",
    summary: "Pioneering the next generation of computing",
    goalAmount: 200.0,
    raisedAmount: 156.8,
    endDate: "2025-01-31T23:59:59.000Z",
    status: "active" as const,
    category: "technology" as const,
    imageUrl: "/quantum-computing-concept.png",
    videoUrl: null,
    contractAddress: "0x5555555555555555555555555555555555555555",
    backersCount: 445,
    creator: {
      id: "user2",
      email: "jane@example.com",
      name: "Jane Smith",
      walletAddress: "0x2345678901234567890123456789012345678901",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      bio: "Creative designer and sustainability advocate",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-25T00:00:00.000Z",
    updatedAt: "2024-01-25T00:00:00.000Z",
  },
  {
    id: generateMockUUID(6), // 00000006-0000-0000-0000-000000000006
    title: "Vertical Urban Garden System",
    description:
      "Modular vertical farming system for urban environments that uses hydroponics and LED growing lights to produce fresh vegetables year-round with 90% less water.",
    summary: "Bringing sustainable food production to cities",
    goalAmount: 60.0,
    raisedAmount: 38.7,
    endDate: "2024-11-20T23:59:59.000Z",
    status: "active" as const,
    category: "environment" as const,
    imageUrl: "/vertical-urban-garden.jpg",
    videoUrl: null,
    contractAddress: "0x6666666666666666666666666666666666666666",
    backersCount: 201,
    creator: {
      id: "user3",
      email: "mike@example.com",
      name: "Mike Johnson",
      walletAddress: "0x3456789012345678901234567890123456789012",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      bio: "Environmental scientist and clean energy researcher",
      isVerified: true,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    rewards: [],
    fundings: [],
    createdAt: "2024-01-12T00:00:00.000Z",
    updatedAt: "2024-01-12T00:00:00.000Z",
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const backendBaseUrl = getReachableBackendApiUrl();

    // Try to fetch from backend first
    if (backendBaseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const backendUrl = new URL(`${backendBaseUrl}/campaigns`);
      if (status) backendUrl.searchParams.set("status", status);
      if (category) backendUrl.searchParams.set("category", category);
      if (search) backendUrl.searchParams.set("search", search);
      backendUrl.searchParams.set("page", page.toString());
      backendUrl.searchParams.set("limit", limit.toString());

      const backendResponse = await fetch(backendUrl.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const data = await backendResponse.json();
        return NextResponse.json(data);
      }
    } catch (backendError: any) {
      if (backendError.name === "AbortError") {
        console.warn("Backend timeout, using mock data");
      } else {
        console.warn("Backend not available, using mock data:", backendError);
      }
    }
    }

    // Fallback to mock data if backend is not available
    let filteredCampaigns = mockCampaigns;

    if (status) {
      filteredCampaigns = filteredCampaigns.filter((c) => c.status === status);
    }

    if (category) {
      filteredCampaigns = filteredCampaigns.filter(
        (c) => c.category === category
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredCampaigns = filteredCampaigns.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower)
      );
    }

    // Paginate
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedCampaigns = filteredCampaigns.slice(start, end);

    return NextResponse.json({
      campaigns: paginatedCampaigns,
      total: filteredCampaigns.length,
      page,
      limit,
      totalPages: Math.ceil(filteredCampaigns.length / limit),
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const campaignData = await request.json();

    const backendBaseUrl = getReachableBackendApiUrl();

    // Try to create campaign in backend
    if (backendBaseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const backendResponse = await fetch(`${backendBaseUrl}/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth token if available
          ...(request.headers.get("authorization") && {
            Authorization: request.headers.get("authorization")!,
          }),
        },
        body: JSON.stringify(campaignData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const createdCampaign = await backendResponse.json();
        return NextResponse.json(createdCampaign, { status: 201 });
      } else {
        // Handle 401 Unauthorized - user not authenticated
        if (backendResponse.status === 401) {
          console.log(
            "Backend returned 401 (Unauthorized), creating campaign locally as fallback"
          );

          // Fallback: Create campaign locally (for demo purposes)
          // Generate UUID-like ID for fallback campaign
          const fallbackId = generateMockUUID(Date.now());
          const fallbackCampaign = {
            id: fallbackId,
            ...campaignData,
            status: "active",
            raisedAmount: 0,
            backersCount: 0,
            contractAddress: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            creator: {
              id: "local_user",
              name: "Local User",
              email: "local@example.com",
            },
            rewards: campaignData.rewards || [],
            fundings: [],
          };

          return NextResponse.json(fallbackCampaign, { status: 201 });
        }

        // For other errors, return the error (NestJS validation returns message as string[])
        const errorData = await backendResponse.json().catch(() => ({}));
        const message = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message || "Failed to create campaign";
        console.error("Backend campaign create failed:", backendResponse.status, message);
        return NextResponse.json(
          { error: message },
          { status: backendResponse.status }
        );
      }
    } catch (backendError: any) {
      console.error("Backend error:", backendError);

      // For timeout errors or any other errors, create fallback campaign
      if (backendError.name === "AbortError") {
        console.log("Backend timeout, creating campaign locally as fallback");
      } else {
        console.log(
          "Backend unavailable, creating campaign locally as fallback"
        );
      }

      // Fallback: Create campaign locally (for demo purposes)
      console.log("Creating campaign locally as fallback");
      // Generate UUID-like ID for fallback campaign
      const fallbackId = generateMockUUID(Date.now());
      const fallbackCampaign = {
        id: fallbackId,
        ...campaignData,
        status: "active",
        raisedAmount: 0,
        backersCount: 0,
        contractAddress: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: "local_user",
          name: "Local User",
          email: "local@example.com",
        },
        rewards: campaignData.rewards || [],
        fundings: [],
      };

      return NextResponse.json(fallbackCampaign, { status: 201 });
    }
    }

    // No reachable backend — create locally as fallback
    const fallbackId = generateMockUUID(Date.now());
    const fallbackCampaign = {
      id: fallbackId,
      ...campaignData,
      status: "active",
      raisedAmount: 0,
      backersCount: 0,
      contractAddress: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      creator: {
        id: "local_user",
        name: "Local User",
        email: "local@example.com",
      },
      rewards: campaignData.rewards || [],
      fundings: [],
    };

    return NextResponse.json(fallbackCampaign, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
