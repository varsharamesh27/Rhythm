import { ProtectedPage } from "@/components/layout/protected-page";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function SettingsPage() {
  return (
    <ProtectedPage>
      <PlaceholderPage title="Settings" description="Account, privacy, goals, and notification preferences will be configured here." />
    </ProtectedPage>
  );
}
