import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubscribeNewsletterDto {
  @ApiProperty({ description: "Email address" })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: "Subscription source", required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}

export class UnsubscribeNewsletterDto {
  @ApiProperty({ description: "Email address", required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: "Unsubscribe token from email link", required: false })
  @IsOptional()
  @IsString()
  token?: string;
}
