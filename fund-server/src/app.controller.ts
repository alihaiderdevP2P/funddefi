import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: "🚀 FundFlow API Server",
      version: "1.0.0",
      status: "running",
      documentation: {
        all: "/docs",
        user: "/docs/user",
        admin: "/docs/admin",
        superadmin: "/docs/superadmin",
      },
      endpoints: {
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        campaigns: "/api/v1/campaigns",
        funding: "/api/v1/funding",
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Get("health")
  getHealth() {
    return {
      status: "healthy",
      timestamp: new Date().toISOString(),
    };
  }
}
