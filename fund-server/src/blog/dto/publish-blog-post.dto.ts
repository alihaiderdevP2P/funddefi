import { IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PublishBlogPostDto {
  @ApiProperty({ description: "Whether to publish (true) or unpublish (false)" })
  @IsBoolean()
  publish: boolean;
}
