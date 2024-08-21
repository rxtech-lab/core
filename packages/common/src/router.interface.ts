import type React from "react";
import { z } from "zod";

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

/**
 * Represents a route in the application.
 * It's a string that defines the URL path.
 */
export type Route = string;

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

/**
 * Represents a component that has been rendered for a specific route.
 */
export type RenderedComponent = {
  /** The matched route information */
  matchedRoute: MatchedRoute;
  /** The actual component to be rendered */
  component: any;
  /** Query string parameters from the URL */
  queryString: QueryString;
  /** Path parameters extracted from the URL */
  params: PathParams;
  /** The full path that was matched */
  path: string;
  currentRoute: Route;
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
   * The file path of the component that will render this route.
   */
  filePath: string;

  /**
   * Nested routes under this route, if any.
   */
  subRoutes?: RouteInfo[];

  /**
   * Indicates whether the route's component is asynchronously loaded.
   */
  isAsync?: boolean;

  /**
   * Additional metadata associated with the route.
   */
  metadata?: RouteMetadata;
}

/**
 * Extends RouteInfo with the actual component import.
 */
export interface ImportedRoute extends RouteInfo {
  /**
   * A function that returns the component for this route.
   * The component can be either a client-side or server-side rendered component.
   */
  component: () => ClientComponent | ServerComponent;
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
