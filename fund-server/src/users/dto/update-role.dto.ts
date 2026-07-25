import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateRoleDto {
  @ApiProperty({
    description: "New user role",
    enum: ["user", "admin", "superadmin"],
  })
  @IsEnum(["user", "admin", "superadmin"])
  role: "user" | "admin" | "superadmin";
}
