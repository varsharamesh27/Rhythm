import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-2 max-w-2xl text-stone-600">{description}</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Coming into focus</CardTitle></CardHeader>
        <CardContent><p className="text-stone-600">This page is included in the app shell so navigation is complete. The Today check-in and Dashboard are the working vertical slice in this pass.</p></CardContent>
      </Card>
    </div>
  );
}
