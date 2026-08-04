import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel empty-state">
      <h2>That page is not in the V1 scaffold yet.</h2>
      <p>
        The new repository is being rebuilt cleanly around FRC-specific workflows instead of
        dragging over CreateMod domain logic.
      </p>
      <p>
        <Link href="/parts" className="button-link">
          Browse current listings
        </Link>
      </p>
    </section>
  );
}
