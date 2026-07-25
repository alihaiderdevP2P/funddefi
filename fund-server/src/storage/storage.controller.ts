import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { StorageService } from "./storage.service";

@ApiTags("upload")
@Controller("upload")
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post("image")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload campaign image to Supabase Storage" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }
    const url = await this.storageService.uploadImage(file);
    return { url };
  }

  @Post("document")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload resume/document to Supabase Storage" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } },
    },
  })
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("No file provided");
    }
    const url = await this.storageService.uploadDocument(file);
    return { url };
  }
}
