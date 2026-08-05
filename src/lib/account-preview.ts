export type PreviewJoinedTeam = {
  code: string;
  handle: string;
  title: string;
  joinedAt: string;
};

export type PreviewSession = {
  email: string;
  joinedTeams: PreviewJoinedTeam[];
  signedInAt: string;
};

type DemoTeamDirectoryEntry = {
  code: string;
  handle: string;
  title: string;
};

export const previewSessionStorageKey = "frc-addon-preview-session-v1";

const demoTeamDirectory: DemoTeamDirectoryEntry[] = [
  { code: "000031", handle: "team-31", title: "31 / Prime Movers" },
  { code: "001778", handle: "team-1778", title: "1778 / Chill Out" },
  { code: "005940", handle: "team-5940", title: "5940 / BREAD" },
  { code: "006328", handle: "team-6328", title: "6328 / Mechanical Advantage" }
];

export const previewJoinCodeExamples = demoTeamDirectory;

export function normalizePreviewTeamCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function parsePreviewSession(raw: string | null): PreviewSession | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PreviewSession>;

    if (typeof parsed.email !== "string" || typeof parsed.signedInAt !== "string") {
      return null;
    }

    const joinedTeams = Array.isArray(parsed.joinedTeams)
      ? parsed.joinedTeams.filter(
          (team): team is PreviewJoinedTeam =>
            typeof team?.code === "string" &&
            typeof team?.handle === "string" &&
            typeof team?.title === "string" &&
            typeof team?.joinedAt === "string"
        )
      : [];

    return {
      email: parsed.email,
      joinedTeams,
      signedInAt: parsed.signedInAt
    };
  } catch {
    return null;
  }
}

export function resolveJoinedTeamFromCode(code: string): PreviewJoinedTeam {
  const normalizedCode = normalizePreviewTeamCode(code);
  const knownTeam = demoTeamDirectory.find((entry) => entry.code === normalizedCode);

  if (knownTeam) {
    return {
      ...knownTeam,
      joinedAt: new Date().toISOString()
    };
  }

  const teamNumber = String(Number.parseInt(normalizedCode, 10) || 0);

  return {
    code: normalizedCode,
    handle: `team-${teamNumber}`,
    title: `${teamNumber} / Joined Team`,
    joinedAt: new Date().toISOString()
  };
}
