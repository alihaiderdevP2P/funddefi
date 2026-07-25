import {
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import type { Socket } from "socket.io";

interface AuthenticatedSocket extends Socket {
  user?: {
    id: string;
    email: string;
  };
}

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: AuthenticatedSocket = context.switchToWs().getClient();
    const data = context.switchToWs().getData();

    try {
      const token = data.token || client.handshake.auth.token;

      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      client.user = {
        id: payload.sub,
        email: payload.email,
      };

      return true;
    } catch (error) {
      return false;
    }
  }
}
