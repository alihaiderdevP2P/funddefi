import { NextResponse } from "next/server";
import { getReachableBackendApiUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization required" },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    const backendBaseUrl = getReachableBackendApiUrl();

    // Try to change password in backend
    if (backendBaseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Note: Backend might have a different endpoint for password change
      // Adjust the endpoint based on your backend implementation
      const backendResponse = await fetch(
        `${backendBaseUrl}/auth/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        return NextResponse.json(result, { status: 200 });
      } else {
        const errorData = await backendResponse.json().catch(() => ({}));
        const message = errorData.message;
        const errorMessage = Array.isArray(message)
          ? message[0]
          : message || errorData.error || "Failed to change password";
        return NextResponse.json(
          { error: errorMessage },
          { status: backendResponse.status }
        );
      }
    } catch (backendError: any) {
      if (backendError.name === "AbortError") {
        console.log("Backend timeout, password change failed");
      } else {
        console.warn("Backend unavailable:", backendError);
      }

      // For password changes, we should not allow fallback for security
      return NextResponse.json(
        {
          error:
            "Backend unavailable. Password change requires backend connection.",
        },
        { status: 503 }
      );
    }
    }

    // For password changes, we should not allow fallback for security
    return NextResponse.json(
      {
        error:
          "Backend unavailable. Password change requires backend connection.",
      },
      { status: 503 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
