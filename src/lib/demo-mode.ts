export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("example.supabase.co") || key.includes("placeholder");
}
