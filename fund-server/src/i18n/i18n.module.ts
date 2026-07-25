import { Module, Global } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { I18nService } from "./i18n.service";
import { I18nInterceptor } from "./interceptors/i18n.interceptor";

@Global()
@Module({
  providers: [
    I18nService,
    {
      provide: APP_INTERCEPTOR,
      useClass: I18nInterceptor,
    },
  ],
  exports: [I18nService],
})
export class I18nModule {}
