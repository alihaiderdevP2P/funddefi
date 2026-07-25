const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/** Upload image file to Supabase Storage via fund-server. Returns public URL. */
export async function uploadImage(
  file: File,
  token?: string | null,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    let message = "Image upload failed";
    try {
      const body = await response.json();
      message = body.message || body.error || message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

/** @deprecated Use uploadImage — kept for campaign create flow */
export const uploadCampaignImage = uploadImage;

/** Profile avatars (same storage endpoint, 2MB client-side limit in settings) */
export const uploadProfileImage = uploadImage;
