import { ProtectedPage } from "@/components/layout/protected-page";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function SchedulePage() {
  return (
    <ProtectedPage>
      <PlaceholderPage title="Schedule" description="Planned-versus-actual schedule blocks will connect to templates and daily entries." />
    </ProtectedPage>
  );
}
