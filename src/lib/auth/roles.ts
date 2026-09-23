import { createServerFn } from "@tanstack/react-start";
import type { AppRole } from "./roles.server";

export type AccessRole = { authenticated: boolean; role: AppRole };

export const getAccessRole = createServerFn({ method: "GET" }).handler(async (): Promise<AccessRole> => {
  const { getCurrentRole } = await import("./roles.server");
  return getCurrentRole();
});
