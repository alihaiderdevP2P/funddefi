import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: "🚀 FundFlow API Server",
      version: "1.0.0",
      status: "running",
      documentation: "/api/docs",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        campaigns: "/api/campaigns",
        funding: "/api/funding",
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
