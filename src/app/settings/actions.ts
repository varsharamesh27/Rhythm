"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/lib/db/auth";
import { upsertProfile } from "@/lib/db/profile";
import { settingsSchema } from "@/lib/validations/settings";

export async function saveSettingsAction(formData: FormData): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  const parsed = settingsSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    timezone: formData.get("timezone"),
    leaderboardOptIn: formData.get("leaderboardOptIn") === "on",
    leaderboardName: formData.get("leaderboardName")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Settings are invalid");
  await upsertProfile({ userId, ...parsed.data });
  revalidatePath("/settings");
  revalidatePath("/leaderboard");
}
