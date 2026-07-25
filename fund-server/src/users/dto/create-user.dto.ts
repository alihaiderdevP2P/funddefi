import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: "User email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ description: "User full name" })
  @IsString()
  name: string;

  @ApiProperty({ description: "User password", minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: "User wallet address", required: false })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  @ApiProperty({ description: "User avatar URL", required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "User bio", required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: "User role",
    required: false,
    enum: ["user", "admin", "superadmin"],
  })
  @IsOptional()
  @IsString()
  role?: "user" | "admin" | "superadmin";
}
