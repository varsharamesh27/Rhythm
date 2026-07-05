import { ProtectedPage } from "@/components/layout/protected-page";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function HealthPage() {
  return (
    <ProtectedPage>
      <PlaceholderPage title="Health" description="Sleep, hydration, workouts, walks, nutrition, mood, energy, and optional weight trends will be grouped here." />
    </ProtectedPage>
  );
}
