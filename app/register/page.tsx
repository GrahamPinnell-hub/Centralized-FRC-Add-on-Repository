import { SectionTitle } from "@/components/ui";

export default function RegisterPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Account"
        title="Create a creator account"
        body="The first account model is simple enough for fast launch, but it is already pointed toward team-based ownership later."
      />
      <form className="panel upload-form">
        <label>
          Display name
          <input placeholder="Team 31 Resource Library" />
        </label>
        <label>
          Handle
          <input placeholder="team-31" />
        </label>
        <label>
          Email
          <input type="email" placeholder="cad@team.org" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Create a password" />
        </label>
        <button type="button">Create account</button>
      </form>
    </div>
  );
}
