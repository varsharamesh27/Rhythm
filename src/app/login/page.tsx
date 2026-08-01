import { redirect } from "next/navigation";
import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  redirect(isDemoMode() ? "/dashboard" : "/auth/anonymous?next=/dashboard");
}
