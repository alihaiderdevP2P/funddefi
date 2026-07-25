import { IsBoolean, IsOptional } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserAdminDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSuspended?: boolean;
}
