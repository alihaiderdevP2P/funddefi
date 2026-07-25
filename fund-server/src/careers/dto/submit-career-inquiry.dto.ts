import { IsString, IsEmail, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitCareerInquiryDto {
  @ApiProperty({ description: "Full name" })
  @IsString()
  @MaxLength(255)
  fullName: string;

  @ApiProperty({ description: "Email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Role of interest" })
  @IsString()
  @MaxLength(100)
  interestedRole: string;

  @ApiProperty({ description: "Message" })
  @IsString()
  message: string;
}
