import { NextResponse } from "next/server";

// Helper to generate UUID-like IDs for mock data
function generateMockUUID(seed: number): string {
  const hex = seed.toString(16).padStart(32, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(
    12,
    16
  )}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Mock campaigns data to display without backend
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
];

export async function GET() {
  try {
    // Return featured campaigns (first 3 campaigns)
    return NextResponse.json(mockCampaigns.slice(0, 3));
  } catch (error) {
    console.error("Error fetching featured campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured campaigns" },
      { status: 500 }
    );
  }
}
