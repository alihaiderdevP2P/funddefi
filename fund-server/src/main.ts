import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";

let cachedApp: any;

async function createApp() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = "api";
  const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,https://funddefi-client.vercel.app")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix(globalPrefix);

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

  const config = new DocumentBuilder()
    .setTitle("Crowdfunding 3.0 API")
    .setDescription("API Documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);

  await app.init();

  return app;
}

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createApp();
  }

  const httpAdapter = cachedApp.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  return instance(req, res);
}