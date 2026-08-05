import { SectionTitle } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Account"
        title="Log in"
        body="Start with a basic account path now, then layer in team-managed access, richer permissions, and OAuth as the publishing workflow grows."
      />
      <form className="panel upload-form">
        <label>
          Email
          <input type="email" placeholder="mentor@team.org" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Password" />
        </label>
        <button type="button">Log in</button>
      </form>
    </div>
  );
}
