import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto {
  @ApiProperty({ description: "Admin email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "Admin full name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "Admin password", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Admin role",
    enum: ["admin", "superadmin"],
    example: "admin",
  })
  @IsEnum(["admin", "superadmin"])
  role: "admin" | "superadmin";

  @ApiProperty({ description: "Wallet address", required: false })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({ description: "Avatar URL", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "Bio", required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}
