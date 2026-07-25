import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({
    status: 201,
    description: "User created successfully",
    type: User,
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get all users" })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    type: [User],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get user by ID" })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: User,
  })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update user" })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: User,
  })
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete user" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  /**
   * ADMIN MANAGEMENT ENDPOINTS - SUPERADMIN ONLY
   */

  @Post("admin/create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create admin or superadmin user (Superadmin only)",
    description:
      "Only superadmin can create admin accounts. Regular registration always creates 'user' role.",
  })
  @ApiResponse({
    status: 201,
    description: "Admin user created successfully",
    type: User,
  })
  @ApiResponse({ status: 403, description: "Forbidden - Superadmin only" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async createAdmin(@Body() createAdminDto: CreateAdminDto, @Request() req) {
    // Double check: Only superadmin can create admins
    if (req.user.role !== "superadmin") {
      throw new ForbiddenException("Only superadmin can create admin accounts");
    }

    // Prevent creating superadmin (only should be 2-3 specific accounts)
    if (createAdminDto.role === "superadmin") {
      // Check how many superadmins exist
      const allUsers = await this.usersService.findAll();
      const superadminCount = allUsers.filter(
        (u) => u.role === "superadmin"
      ).length;

      if (superadminCount >= 3) {
        throw new ForbiddenException(
          "Maximum of 3 superadmin accounts allowed. Cannot create more."
        );
      }
    }

    return this.usersService.createAdmin(createAdminDto, createAdminDto.role);
  }

  @Patch(":id/role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update user role (Superadmin only)",
    description:
      "Only superadmin can change user roles. Controls admin assignments.",
  })
  @ApiResponse({
    status: 200,
    description: "User role updated successfully",
    type: User,
  })
  @ApiResponse({ status: 403, description: "Forbidden - Superadmin only" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  async updateRole(
    @Param("id") id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Request() req
  ) {
    // Double check: Only superadmin can change roles
    if (req.user.role !== "superadmin") {
      throw new ForbiddenException("Only superadmin can change user roles");
    }

    // Prevent creating too many superadmins
    if (updateRoleDto.role === "superadmin") {
      const allUsers = await this.usersService.findAll();
      const superadminCount = allUsers.filter(
        (u) => u.role === "superadmin"
      ).length;

      const currentUser = await this.usersService.findOne(id);
      const isAlreadySuperadmin = currentUser.role === "superadmin";

      if (!isAlreadySuperadmin && superadminCount >= 3) {
        throw new ForbiddenException(
          "Maximum of 3 superadmin accounts allowed. Cannot promote user to superadmin."
        );
      }
    }

    return this.usersService.updateRole(id, updateRoleDto.role);
  }

  @Get("admin/list")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("superadmin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "List all admin users (Superadmin only)",
  })
  @ApiResponse({
    status: 200,
    description: "Admin users retrieved successfully",
    type: [User],
  })
  async listAdmins(@Request() req) {
    if (req.user.role !== "superadmin") {
      throw new ForbiddenException("Only superadmin can list admin users");
    }

    const allUsers = await this.usersService.findAll();
    return allUsers.filter(
      (u) => u.role === "admin" || u.role === "superadmin"
    );
  }
}
