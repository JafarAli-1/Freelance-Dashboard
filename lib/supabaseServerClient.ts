import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getSupabaseServerClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const store: any = (cookies as unknown as () => any)();
            return store.get(name)?.value;
          } catch {
            return undefined;
          }
        },
        set(name: string, value: string, options?: any) {
          try {
            const store: any = (cookies as unknown as () => any)();
            store.set?.(name, value, options);
          } catch {
            // In Server Components, cookies are read-only; ignore
          }
        },
        remove(name: string, options?: any) {
          try {
            const store: any = (cookies as unknown as () => any)();
            store.delete?.(name, options);
          } catch {
            // Ignore in read-only contexts
          }
        },
      },
    }
  );
}

export default getSupabaseServerClient;
