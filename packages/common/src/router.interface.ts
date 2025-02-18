import type React from "react";
import { z } from "zod";
import { CoreInterface } from "./core.interface";
import { ErrorPageProps, PageProps } from "./page.interface";

export const RouteMetadataSchema = z.object({
  title: z
    .string({
      description: "The title of the route, often used for the page title",
    })
    .optional(),
  description: z
    .string({
      description: "A brief description of the route's content",
    })
    .optional(),
  includeInMenu: z
    .boolean({
      description: "Whether this route should be included in navigation menus",
    })
    .optional(),
});

/**
 * Metadata associated with a route.
 */
export type RouteMetadata = z.infer<typeof RouteMetadataSchema>;

/** The default folder name for application components */
export const DEFAULT_APP_FOLDER = "app";

export type SpecialRouteType = "error" | "404" | "page" | "api" | "layout";

/**
 * Represents a route in the application.
 * It's a string that defines the URL path.
 */
export type Route = string;

/**
 * Represents the route stored in the storage
 */
export type StoredRoute = {
  route: Route;
  type: SpecialRouteType;
  props?: PageProps;
};

/** Represents a client-side React component */
export type ClientComponent = React.JSX.Element;

/** Represents a server-side React component */
export type ServerComponent = Promise<React.JSX.Element>;

/** The default root route of the application */
export const DEFAULT_ROOT_ROUTE: Route = "/";

/**
 * Represents query string parameters.
 * Keys are parameter names, values can be string, null, or boolean.
 */
export type QueryString = Record<string, string | null | boolean>;

/**
 * Represents path parameters extracted from the URL.
 * Keys are parameter names, values are always strings.
 */
export type PathParams = Record<string, string>;

export type RenderedComponentProps =
  | PageProps
  | ErrorPageProps
  | Record<any, any>;

/**
 * Represents a component that has been rendered for a specific route.
 */
export type RenderedComponent = {
  /** The matched route information */
  matchedRoute: MatchedRoute;
  /** The actual component to be rendered */
  component?: () => React.ReactElement;
  /**
   * If the components rendered are layouts, this will contain the layout components.
   */
  components?: () => React.ReactElement[];
  /** Query string parameters from the URL */
  queryString: QueryString;
  /** Path parameters extracted from the URL */
  params: PathParams;
  /** Properties passed to the component */
  props: RenderedComponentProps;
  /** The full path that was matched */
  path: string;
  currentRoute: StoredRoute;
  /**
   * Indicates whether the component is an error page (404 or error).
   */
  isError?: boolean;
};

export type ComponentKeyProps = {
  route: Route;
};

/**
 * Represents a file that contains route information.
 */
export interface RouteInfoFile {
  routes: RouteInfo[];
}

export type ReactComponentFunction = () => Promise<
  () => ClientComponent | ServerComponent
>;

export interface FunctionRequest
  extends Pick<PageProps, "routeInfoFile" | "storage"> {
  req: Request;
  core: CoreInterface<any>;
}

/**
 * Represents an API function that can be used to define API routes.
 */
export type APIFunction = {
  GET?: (req: FunctionRequest) => Promise<Response>;
  POST?: (req: FunctionRequest) => Promise<Response>;
  PUT?: (req: FunctionRequest) => Promise<Response>;
  DELETE?: (req: FunctionRequest) => Promise<Response>;
  PATCH?: (req: FunctionRequest) => Promise<Response>;
};

/**
 * Represents a route in the application.
 * This structure is generated by `core` and used by `router` to create the routes.
 */
export interface RouteInfo {
  /**
   * The regex pattern used to match the route, following Next.js conventions.
   * Example: `/user/[id]` will match `/user/1` and `/user/2`.
   */
  route: string;

  /**
   * 404 page associated with this route.
   * If no `404.tsx` is found, the default 404 page will be used.
   */
  404: ReactComponentFunction;

  /**
   * error page associated with this route.
   * If no `error.tsx` is found, the default error page will be used.
   */
  error: ReactComponentFunction;

  /**
   * The page component associated with this route.
   */
  page?: ReactComponentFunction;

  /**
   * API functions for this route.
   * Facilitates the creation of API routes, allowing the user to define HTTP methods
   * (GET, POST, PUT, DELETE, PATCH) within the function.
   */
  api?: () => Promise<APIFunction>;

  /**
   * Nested routes under this route, if any.
   */
  subRoutes?: RouteInfo[];

  /**
   * Additional metadata associated with the route.
   */
  metadata?: RouteMetadata;

  /**
   * Layouts associated with this route, if any.
   */
  layouts?: Array<() => Promise<any>>;
}

export interface RouteInfoWithoutImport
  extends Omit<
    RouteInfo,
    "page" | "error" | 404 | "subRoutes" | "api" | "layouts"
  > {
  page?: string;
  error?: string;
  404?: string;
  api?: string;
  subRoutes?: RouteInfoWithoutImport[];
  layouts?: string[];
}

/**
 * Extends RouteInfo with the actual component import.
 */
export interface ImportedRoute
  extends Omit<RouteInfo, "page" | "error" | 404 | "api" | "layouts"> {
  page?: () => ClientComponent | ServerComponent;
  error?: () => ClientComponent | ServerComponent;
  404?: () => ClientComponent | ServerComponent;
  api?: () => APIFunction;
  layouts?: Array<() => Promise<any>>;
}
/**
 * Represents a route that has been matched to a specific URL.
 */
export interface MatchedRoute extends ImportedRoute {
  /**
   * Parameters extracted from the route.
   * For a route like `/user/[id]` and a path `/user/1`, params would be `{ id: "1" }`.
   */
  params: Record<string, string>;

  /**
   * Query parameters from the URL.
   */
  query: Record<string, string>;
}

export interface ReloadOptions {
  /**
   * Indicates whether the new message should be rendered when reloading the page.
   */
  shouldRenderNewMessage?: boolean;
}
