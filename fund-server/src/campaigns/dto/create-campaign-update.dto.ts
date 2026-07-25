import { IsString, MinLength, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateCampaignUpdateDto {
  @ApiProperty({ description: "Update title" })
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({ description: "Update content" })
  @IsString()
  @MinLength(10)
  content: string;
}
