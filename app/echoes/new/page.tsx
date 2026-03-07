import EchoWizard from "@/components/echoes/echo-wizard";

export default function NewEchoPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <EchoWizard />
    </main>
  );
}