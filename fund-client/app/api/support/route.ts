import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${API_URL}/support/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: body.name || body.fullName,
        email: body.email,
        category: body.category,
        priority: body.priority,
        subject: body.subject,
        description: body.description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || data.error || "Failed to create ticket" },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ticket: {
          id: data.ticketNumber,
          status: data.status,
          message: data.message,
          estimatedResponseTime: data.estimatedResponseTime,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get("ticketId");

    if (!ticketId) {
      return NextResponse.json(
        { error: "Ticket ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/support/tickets/${ticketId}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Ticket not found" },
        { status: response.status }
      );
    }

    return NextResponse.json({ ticket: data });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}
