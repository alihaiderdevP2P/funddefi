const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

/** Upload resume/document to Supabase Storage via fund-server. Returns public URL. */
export async function uploadDocument(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload/document`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Document upload failed";
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
