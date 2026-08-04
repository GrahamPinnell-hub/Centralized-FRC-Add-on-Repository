import { SectionTitle } from "@/components/ui";

export default function LoginPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Account"
        title="Log in"
        body="V1 starts with a basic account path. Team-managed access, richer permissions, and OAuth can layer in after the repository workflow itself is stable."
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
