import { BadRequestException, Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";

@Injectable()
export class StorageService {
  private client: SupabaseClient | null = null;
  private readonly bucket =
    process.env.SUPABASE_STORAGE_BUCKET || "campaign-images";

  private getClient(): SupabaseClient {
    if (!this.client) {
      const url =
        process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key) {
        throw new BadRequestException(
          "Supabase storage is not configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)",
        );
      }
      this.client = createClient(url, key);
    }
    return this.client;
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No file provided");
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid image type. Use JPEG, PNG, WebP, or GIF.",
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException("Image must be under 10MB");
    }

    const ext = file.originalname.split(".").pop()?.toLowerCase() || "jpg";
    const path = `campaigns/${randomUUID()}.${ext}`;
    const supabase = this.getClient();

    const { error } = await supabase.storage.from(this.bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async uploadDocument(file: Express.Multer.File): Promise<string> {
    if (!file?.buffer?.length) {
      throw new BadRequestException("No file provided");
    }

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid document type. Use PDF, DOC, or DOCX.",
      );
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException("Document must be under 5MB");
    }

    const ext = file.originalname.split(".").pop()?.toLowerCase() || "pdf";
    const path = `resumes/${randomUUID()}.${ext}`;
    const supabase = this.getClient();

    const { error } = await supabase.storage.from(this.bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) {
      throw new BadRequestException(`Upload failed: ${error.message}`);
    }

    const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
