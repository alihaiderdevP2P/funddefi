import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Body,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { Roles } from "./decorators/roles.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "User login" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  @ApiResponse({ status: 409, description: "User already logged in" })
  login(
    @Body() loginDto: LoginDto,
    @Request() req,
    @Body("invalidateExisting") invalidateExisting?: boolean
  ) {
    // By default, invalidate existing sessions (allow new login)
    // Set invalidateExisting=false to prevent concurrent logins
    // Locale is automatically set by I18nInterceptor from Accept-Language header
    const locale = (req.locale || "en") as "en" | "es" | "fr";
    return this.authService.login(loginDto, invalidateExisting ?? true, locale);
  }

  @Post("register")
  @ApiOperation({ summary: "User registration" })
  @ApiResponse({ status: 201, description: "Registration successful" })
  @ApiResponse({ status: 401, description: "User already exists" })
  register(@Body() registerDto: RegisterDto, @Request() req) {
    // Locale is automatically set by I18nInterceptor from Accept-Language header
    const locale = (req.locale || "en") as "en" | "es" | "fr";
    return this.authService.register(registerDto, locale);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get user profile" })
  @ApiResponse({ status: 200, description: "Profile retrieved successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "User logout" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  logout(@Request() req) {
    return this.authService.logout(req.user.email);
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Change user password" })
  @ApiResponse({ status: 200, description: "Password changed successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized or incorrect password" })
  @ApiResponse({ status: 400, description: "Invalid request" })
  changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post("admin/create-user")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin", "superadmin")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Create regular user (Admin only)",
    description:
      "Creates a user with 'user' role only. To create admin accounts, use /users/admin/create endpoint (Superadmin only).",
  })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  createUser(@Body() registerDto: RegisterDto) {
    // Force role to "user" - this endpoint can only create regular users
    // Admin creation must go through /users/admin/create (superadmin only)
    const userData = {
      ...registerDto,
      role: "user" as const,
    };
    return this.authService.register(userData);
  }
}
