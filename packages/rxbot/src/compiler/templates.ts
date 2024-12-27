/**
 * This file contains templates for special files that are generated by the compiler.
 */
export const DEFAULT_404_PAGE = `
export default function NotFound() {
   return <div>
   <h1>404 - Page Not Found</h1>
   </div>;
}        
`;

export const DEFAULT_ERROR_PAGE = `
export default function Error() {
   return <div>
    <h1>Something went wrong</h1>
    </div>;
   }        
`;

export const DEFAULT_PAGE = `
export default function Page() {
   return <div>
   <h1>Hello, welcome</h1>
   </div>;
}        
`;

export const DEFAULT_LAYOUT = `
import { LayoutProps } from "@rx-lab/common";

export default function RootLayout({ children }: LayoutProps) {
  return (
    <div>
      {children}
    </div>
  );
}        
`;

export const METADATA_FILE_TEMPLATE = `{% macro renderSubRoutes(items) %}{% for subRoute in items %}
 {
          "route": "{{ subRoute.route }}",{% if subRoute.page %}
          "page": () => import("{{ subRoute.page }}"),{% endif %}{% if subRoute['404'] %}
          "404": () => import("{{ subRoute['404'] }}"),{% endif %}{% if subRoute.api %}
          "api": () => import("{{ subRoute.api }}"),{% endif %}{% if subRoute.error %}
          "error": () => import("{{ subRoute.error }}"),{% endif %}{% if subRoute.layouts %}
          "layouts": [{% for layout in subRoute.layouts %}() => import("{{ layout }}"){% if not loop.last %},{% endif %}{% endfor %}],{% endif %}{% if subRoute.metadata %}
          "metadata": {{ subRoute.metadata | dump }},{% endif %}{% if subRoute.subRoutes %}
          "subRoutes": [{{ renderSubRoutes(subRoute.subRoutes) }}]{% endif %}
        }{% if not loop.last %},{% endif %}{% endfor %}{% endmacro %}

export const ROUTE_FILE = {
  "routes": [{% for route in routes -%}
    {
      "route": "{{ route.route }}",{% if route.page %}
      "page": () => import("{{ route.page }}"),{% endif %}{% if route['404'] %}
      "404": () => import("{{ route['404'] }}"),{% endif %}{% if route.api %}
      "api": () => import("{{ route.api }}"),{% endif %}{% if route.error %}
      "error": () => import("{{ route.error }}"),{% endif %}{% if route.layouts %}
      "layouts": [{% for layout in route.layouts %}() => import("{{ layout }}"){% if not loop.last %},{% endif %}{% endfor %}],{% endif %}{% if route.metadata %}
      "metadata": {{ route.metadata | dump }},{% endif %}
      {% if route.subRoutes %}"subRoutes": [{{ renderSubRoutes(route.subRoutes) }}]{% endif %}
    }{% if not loop.last %},{% endif %}{% endfor %}
  ]
}`;

export const INDEX_FILE_TEMPLATE = `
export { ROUTE_FILE } from "./route-metadata";
{% if hasAdapterFile %}
export { adapter, storage } from "./app/adapter";
{% endif %}
`;
