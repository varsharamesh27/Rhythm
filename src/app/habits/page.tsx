import { ProtectedPage } from "@/components/layout/protected-page";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function HabitsPage() {
  return (
    <ProtectedPage>
      <PlaceholderPage title="Habits" description="Routine habits will live here next: wake time, meditation, yoga, walking, study, and nutrition consistency." />
    </ProtectedPage>
  );
}
