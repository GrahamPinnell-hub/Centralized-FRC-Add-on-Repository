import { LoginPanel } from "@/components/login-panel";
import { SectionTitle } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Account"
        title="Log in"
        body="Start with a basic account path now, then layer in team-managed access, richer permissions, and OAuth as the publishing workflow grows."
      />
      <LoginPanel />
    </div>
  );
}
