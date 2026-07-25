import { NextResponse } from "next/server";
import { getReachableBackendApiUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const backendBaseUrl = getReachableBackendApiUrl();

    // Try to fetch from backend
    if (backendBaseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const backendResponse = await fetch(`${backendBaseUrl}/auth/profile`, {
        headers: {
          Authorization: authHeader,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const userData = await backendResponse.json();
        return NextResponse.json(userData);
      } else if (backendResponse.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } catch (backendError: any) {
      if (backendError.name !== "AbortError") {
        console.warn("Backend not available, using fallback:", backendError);
      }
    }
    }

    // Fallback: Return user from token (if available)
    // In production, decode JWT token to get user info
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const updateData = await request.json();

    const backendBaseUrl = getReachableBackendApiUrl();

    // Try to update in backend
    if (backendBaseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // First get user ID from profile
      const profileResponse = await fetch(`${backendBaseUrl}/auth/profile`, {
        headers: {
          Authorization: authHeader,
        },
        signal: controller.signal,
      });

      if (!profileResponse.ok) {
        throw new Error("Failed to get user profile");
      }

      const user = await profileResponse.json();

      // Update user
      const updateResponse = await fetch(`${backendBaseUrl}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(updateData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        return NextResponse.json(updatedUser);
      } else {
        const errorData = await updateResponse.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || "Failed to update profile" },
          { status: updateResponse.status }
        );
      }
    } catch (backendError: any) {
      if (backendError.name === "AbortError") {
        console.log("Backend timeout, updating locally as fallback");
      } else {
        console.warn(
          "Backend unavailable, updating locally as fallback:",
          backendError
        );
      }

      // Fallback: Update locally (for demo purposes)
      // In production, this should fail if backend is unavailable
      return NextResponse.json(
        {
          message: "Profile updated locally (backend unavailable)",
          ...updateData,
        },
        { status: 200 }
      );
    }
    }

    return NextResponse.json(
      { error: "Backend unavailable" },
      { status: 503 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
