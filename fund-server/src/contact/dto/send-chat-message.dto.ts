import { IsString, MinLength, MaxLength, IsOptional, IsEmail } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateChatSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  visitorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  visitorEmail?: string;
}

export class SendChatMessageDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string;
}
