import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { setupRoleSwaggerDocs } from "./swagger-role-docs";

const GLOBAL_PREFIX = "api/v1";

async function createApp() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = (
    process.env.CORS_ORIGINS ||
    "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,https://funddefi-client.vercel.app"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix(GLOBAL_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  setupRoleSwaggerDocs(app, GLOBAL_PREFIX);

  return app;
}

async function bootstrap() {
  const app = await createApp();
  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, "0.0.0.0");
  const baseUrl = `http://localhost:${port}`;
  console.log(`Application listening on port ${port}`);
  console.log(`API:              ${baseUrl}/${GLOBAL_PREFIX}`);
  console.log(`Swagger (all):    ${baseUrl}/docs`);
  console.log(`Swagger (user):   ${baseUrl}/docs/user`);
  console.log(`Swagger (admin):  ${baseUrl}/docs/admin`);
  console.log(`Swagger (super):  ${baseUrl}/docs/superadmin`);
}

bootstrap();
