import { INestApplication, RequestMethod } from "@nestjs/common";
import { ModulesContainer } from "@nestjs/core";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from "@nestjs/swagger";
import { ROLES_KEY } from "./auth/decorators/roles.decorator";

export type SwaggerRoleView = "user" | "admin" | "superadmin";

const METHOD_NAMES: Record<number, string> = {
  [RequestMethod.GET]: "get",
  [RequestMethod.POST]: "post",
  [RequestMethod.PUT]: "put",
  [RequestMethod.DELETE]: "delete",
  [RequestMethod.PATCH]: "patch",
  [RequestMethod.OPTIONS]: "options",
  [RequestMethod.HEAD]: "head",
  [RequestMethod.ALL]: "get",
};

type RouteRoleEntry = {
  method: string;
  path: string;
  roles: string[];
};

function nestPathToOpenApi(path: string): string {
  return (
    "/" +
    path
      .split("/")
      .filter(Boolean)
      .map((segment) =>
        segment.startsWith(":") ? `{${segment.slice(1)}}` : segment
      )
      .join("/")
  );
}

function joinPaths(...parts: string[]): string {
  const joined = parts
    .flatMap((p) => p.split("/"))
    .filter(Boolean)
    .join("/");
  return nestPathToOpenApi(joined);
}

/**
 * Collect Nest route handlers and their @Roles() metadata.
 */
export function collectRouteRoles(
  app: INestApplication,
  globalPrefix = "api/v1"
): RouteRoleEntry[] {
  const modulesContainer = app.get(ModulesContainer);
  const routes: RouteRoleEntry[] = [];

  for (const moduleRef of modulesContainer.values()) {
    for (const wrapper of moduleRef.controllers.values()) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) continue;

      const controllerPath =
        (Reflect.getMetadata(PATH_METADATA, metatype) as string) || "";
      const controllerRoles =
        (Reflect.getMetadata(ROLES_KEY, metatype) as string[]) || [];

      const proto = Object.getPrototypeOf(instance);
      for (const key of Object.getOwnPropertyNames(proto)) {
        if (key === "constructor") continue;
        const handler = proto[key];
        const requestMethod = Reflect.getMetadata(
          METHOD_METADATA,
          handler
        ) as RequestMethod | undefined;
        if (requestMethod === undefined) continue;

        const methodPath =
          (Reflect.getMetadata(PATH_METADATA, handler) as string) || "";
        const handlerRoles =
          (Reflect.getMetadata(ROLES_KEY, handler) as string[]) || [];
        const roles =
          handlerRoles.length > 0 ? handlerRoles : controllerRoles;

        const method = METHOD_NAMES[requestMethod] || "get";
        const path = joinPaths(globalPrefix, controllerPath, methodPath);

        routes.push({ method, path, roles });
      }
    }
  }

  return routes;
}

function viewerCanAccess(
  requiredRoles: string[],
  viewer: SwaggerRoleView
): boolean {
  // No role guard → available to all (public / authenticated user APIs)
  if (!requiredRoles.length) return true;
  if (viewer === "superadmin") return true;
  if (viewer === "admin") return requiredRoles.includes("admin");
  // user view: only endpoints that explicitly allow "user", or none (handled above)
  return requiredRoles.includes("user");
}

function filterDocumentForRole(
  document: OpenAPIObject,
  routeRoles: RouteRoleEntry[],
  viewer: SwaggerRoleView
): OpenAPIObject {
  const access = new Map<string, string[]>();
  for (const route of routeRoles) {
    access.set(`${route.method}:${route.path}`, route.roles);
  }

  const filteredPaths: OpenAPIObject["paths"] = {};

  for (const [path, pathItem] of Object.entries(document.paths || {})) {
    if (!pathItem) continue;
    const next: Record<string, unknown> = { ...pathItem };

    for (const method of [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ] as const) {
      if (!(method in pathItem) || !pathItem[method]) continue;
      const roles = access.get(`${method}:${path}`) ?? [];
      if (!viewerCanAccess(roles, viewer)) {
        delete next[method];
      }
    }

    const hasOps = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "options",
      "head",
    ].some((m) => Boolean(next[m as keyof typeof next]));

    if (hasOps) {
      filteredPaths[path] = next as (typeof filteredPaths)[string];
    }
  }

  return {
    ...document,
    info: {
      ...document.info,
      title: `${document.info.title} (${viewer})`,
      description: [
        document.info.description || "API Documentation",
        "",
        `Role view: **${viewer}**`,
        viewer === "user"
          ? "Shows public and user-facing endpoints."
          : viewer === "admin"
            ? "Shows endpoints available to admin (and public/user APIs)."
            : "Shows all endpoints including superadmin-only.",
        "",
        "1. Use POST /api/v1/auth/login with that role account",
        "2. Copy access_token",
        "3. Click Authorize → Bearer `<token>`",
      ].join("\n"),
    },
    paths: filteredPaths,
  };
}

function buildBaseConfig(titleSuffix?: string) {
  return new DocumentBuilder()
    .setTitle(
      titleSuffix
        ? `Crowdfunding 3.0 API — ${titleSuffix}`
        : "Crowdfunding 3.0 API"
    )
    .setDescription("API Documentation")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
}

/**
 * Mounts:
 * - /docs            → all endpoints
 * - /docs/user       → user / public APIs
 * - /docs/admin      → admin-accessible APIs
 * - /docs/superadmin → all including superadmin-only
 */
export function setupRoleSwaggerDocs(app: INestApplication, globalPrefix = "api/v1") {
  const fullConfig = buildBaseConfig();
  const fullDocument = SwaggerModule.createDocument(app, fullConfig);
  const routeRoles = collectRouteRoles(app, globalPrefix);

  SwaggerModule.setup("docs", app, fullDocument, {
    customSiteTitle: "FundFlow API — All",
    swaggerOptions: { persistAuthorization: true },
  });

  for (const role of ["user", "admin", "superadmin"] as SwaggerRoleView[]) {
    const doc = filterDocumentForRole(fullDocument, routeRoles, role);
    SwaggerModule.setup(`docs/${role}`, app, doc, {
      customSiteTitle: `FundFlow API — ${role}`,
      swaggerOptions: { persistAuthorization: true },
    });
  }

  return {
    all: "/docs",
    user: "/docs/user",
    admin: "/docs/admin",
    superadmin: "/docs/superadmin",
  };
}
