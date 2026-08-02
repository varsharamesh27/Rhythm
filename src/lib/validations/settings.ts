import { z } from "zod";

export const settingsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  timezone: z.string().trim().min(1, "Timezone is required").max(80)
});
