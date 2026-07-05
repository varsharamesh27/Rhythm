import { z } from "zod";

export const settingsSchema = z.object({
  displayName: z.string().trim().min(1, "Display name is required").max(80),
  timezone: z.string().trim().min(1, "Timezone is required").max(80)
});
