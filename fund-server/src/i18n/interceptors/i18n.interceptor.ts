import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { I18nService } from "../i18n.service";

@Injectable()
export class I18nInterceptor implements NestInterceptor {
  constructor(private readonly i18nService: I18nService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const acceptLanguage =
      request.headers?.["accept-language"] ||
      request.headers?.["Accept-Language"];
    const locale = this.i18nService.getLocaleFromHeader(acceptLanguage);

    // Attach locale to request object for easy access
    request.locale = locale;

    return next.handle();
  }
}
