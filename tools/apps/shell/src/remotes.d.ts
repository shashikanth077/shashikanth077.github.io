/**
 * Type declarations for federated modules.
 *
 * Module Federation resolves these at runtime, so TypeScript has nothing to
 * resolve at compile time and needs the shape declared by hand. This file is
 * the type-level half of libs/shell-contract: if a remote changes the props of
 * its exposed component, this declaration must change with it — and the shell
 * fails to compile, which is the early warning we want.
 *
 * All three remotes expose the same interface deliberately. The shell picks one
 * by the `remote` field on the route manifest and passes a slug; it never needs
 * to know what any individual tool does.
 */

declare module "utility_tools/ToolRoutes" {
  import type { ComponentType } from "react";
  export interface ToolRoutesProps {
    slug: string;
  }
  const ToolRoutes: ComponentType<ToolRoutesProps>;
  export default ToolRoutes;
}

declare module "pdf_tools/ToolRoutes" {
  import type { ComponentType } from "react";
  export interface ToolRoutesProps {
    slug: string;
  }
  const ToolRoutes: ComponentType<ToolRoutesProps>;
  export default ToolRoutes;
}

declare module "image_tools/ToolRoutes" {
  import type { ComponentType } from "react";
  export interface ToolRoutesProps {
    slug: string;
  }
  const ToolRoutes: ComponentType<ToolRoutesProps>;
  export default ToolRoutes;
}
