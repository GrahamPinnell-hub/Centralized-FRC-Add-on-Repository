import { SectionTitle, UploadChecklist } from "@/components/ui";

export default function UploadPage() {
  return (
    <div className="page-stack">
      <SectionTitle
        eyebrow="Upload"
        title="Fast path for sharing a useful part"
        body="V1 keeps approval simple: publish immediately, but require enough metadata that another team can actually trust and reuse the listing."
      />
      <div className="two-column">
        <form className="panel upload-form">
          <label>
            Part title
            <input placeholder="MK4i Swerve Wire Cover" />
          </label>
          <label>
            Summary
            <textarea placeholder="What problem does this solve, and what robot hardware is it built around?" />
          </label>
          <label>
            Category
            <select defaultValue="swerve-covers">
              <option value="swerve-covers">Swerve Covers</option>
              <option value="vision-mounts">Vision Mounts</option>
              <option value="electronics-mounts">Electronics Mounts</option>
              <option value="battery-hardware">Battery Hardware</option>
              <option value="driver-station">Driver Station</option>
            </select>
          </label>
          <label>
            Compatibility tags
            <input placeholder="MK4i, Limelight 4, PDH, Radio, Kraken..." />
          </label>
          <label>
            Accepted files for V1
            <input placeholder="STL, STEP, 3MF, DXF, ZIP, source link" />
          </label>
          <label>
            Print / fabrication notes
            <textarea placeholder="Material, nozzle, layer height, bend notes, sponsor notes, hardware requirements..." />
          </label>
          <label>
            Installation notes
            <textarea placeholder="Mounting method, screws, insert sizes, cable routing assumptions..." />
          </label>
          <div className="filter-actions">
            <button type="button">Save draft</button>
            <button type="button">Publish now</button>
          </div>
        </form>
        <UploadChecklist />
      </div>
    </div>
  );
}
