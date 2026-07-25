import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { SessionService } from "./session.service";
import { I18nService } from "../i18n/i18n.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private sessionService: SessionService,
    private i18nService: I18nService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    loginDto: LoginDto,
    invalidateExisting: boolean = true,
    locale: string = "en"
  ) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException(
        this.i18nService.translate("auth.invalid_credentials", locale as any)
      );
    }

    // Check if user is already logged in
    const isAlreadyLoggedIn = this.sessionService.isUserLoggedIn(user.email);

    if (isAlreadyLoggedIn && !invalidateExisting) {
      throw new ConflictException(
        this.i18nService.translate("auth.already_logged_in", locale as any)
      );
    }

    // Generate new token
    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Create or replace session
    const sessionResult = this.sessionService.createSession(
      user.email,
      user.id,
      access_token
    );

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        walletAddress: user.walletAddress,
        avatar: user.avatar,
        bio: user.bio,
        isVerified: user.isVerified,
        role: user.role,
      },
      sessionInfo: {
        invalidatedPrevious: sessionResult.invalidatedOld,
        message: sessionResult.invalidatedOld
          ? this.i18nService.translate(
              "auth.session_invalidated",
              locale as any
            )
          : this.i18nService.translate("auth.session_created", locale as any),
      },
    };
  }

  async register(registerDto: RegisterDto, locale: string = "en") {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException(
        this.i18nService.translate("auth.user_already_exists", locale as any)
      );
    }

    // Force role to "user" - admin/superadmin cannot be created through registration
    const userData = {
      ...registerDto,
      role: "user" as const, // Always set to "user" regardless of any input
    };

    const user = await this.usersService.create(userData);
    const { password, ...result } = user;

    const payload = { email: user.email, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // Create session for new user
    this.sessionService.createSession(user.email, user.id, access_token);

    return {
      access_token,
      user: result,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    const { password, ...result } = user;
    return result;
  }

  async logout(email: string): Promise<void> {
    this.sessionService.removeSession(email);
  }

  async logoutByToken(token: string): Promise<void> {
    this.sessionService.removeSession(token);
  }

  async isTokenActive(token: string): Promise<boolean> {
    return this.sessionService.isTokenValid(token);
  }

  async checkUserLoggedIn(email: string): Promise<boolean> {
    return this.sessionService.isUserLoggedIn(email);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<{ message: string }> {
    const user = await this.usersService.findOne(userId);

    const isCurrentValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    if (
      changePasswordDto.currentPassword === changePasswordDto.newPassword
    ) {
      throw new BadRequestException(
        "New password must be different from current password"
      );
    }

    await this.usersService.updatePassword(userId, changePasswordDto.newPassword);

    return { message: "Password changed successfully" };
  }
}
