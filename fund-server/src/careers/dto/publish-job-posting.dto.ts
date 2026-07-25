import { IsBoolean, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PublishJobPostingDto {
  @ApiProperty({ description: "Publish (true) or unpublish (false)", required: false })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}
