import { ProtectedPage } from "@/components/layout/protected-page";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export default function InsightsPage() {
  return (
    <ProtectedPage>
      <PlaceholderPage title="Insights" description="For now, this remains non-AI. The first insights will be transparent weekly summaries from your own logs." />
    </ProtectedPage>
  );
}
