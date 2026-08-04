export default function LanguagePage() {
  return (
    <section className="page-stack">
      <section className="panel compact-panel">
        <p className="eyebrow">Language</p>
        <h1>Language options for the repository</h1>
        <p>
          V1 stays English-first, but the top-bar language entry is reserved so community
          translations can land without changing the site structure later.
        </p>
        <div className="chip-row">
          <span className="chip chip-accent">English</span>
          <span className="chip">Español</span>
          <span className="chip">Français</span>
          <span className="chip">Português</span>
        </div>
      </section>
      <section className="panel compact-panel">
        <p className="eyebrow">Planned</p>
        <h3>Translation support will follow the same listing structure.</h3>
        <p>
          Categories, listing metadata, and the upload flow are being kept consistent now so
          language-specific copy can be layered in without rebuilding the repository.
        </p>
      </section>
    </section>
  );
}
