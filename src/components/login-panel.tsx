"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  normalizePreviewTeamCode,
  parsePreviewSession,
  previewJoinCodeExamples,
  previewSessionStorageKey,
  resolveJoinedTeamFromCode,
  type PreviewSession
} from "@/lib/account-preview";

type FeedbackTone = "error" | "success";

type FeedbackState = {
  tone: FeedbackTone;
  text: string;
} | null;

function toneClassName(message: FeedbackState) {
  if (!message) {
    return "account-inline-note";
  }

  return `account-inline-note is-${message.tone}`;
}

export function LoginPanel() {
  const [session, setSession] = useState<PreviewSession | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [loginMessage, setLoginMessage] = useState<FeedbackState>(null);
  const [joinMessage, setJoinMessage] = useState<FeedbackState>(null);

  useEffect(() => {
    const storedSession = parsePreviewSession(window.localStorage.getItem(previewSessionStorageKey));

    setSession(storedSession);
    if (storedSession) {
      setEmail(storedSession.email);
    }
  }, []);

  function persistSession(nextSession: PreviewSession | null) {
    setSession(nextSession);

    if (nextSession) {
      window.localStorage.setItem(previewSessionStorageKey, JSON.stringify(nextSession));
      setEmail(nextSession.email);
      return;
    }

    window.localStorage.removeItem(previewSessionStorageKey);
  }

  function onLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setLoginMessage({ tone: "error", text: "Enter both email and password before signing in." });
      return;
    }

    const nextSession: PreviewSession = {
      email: normalizedEmail,
      signedInAt: session?.signedInAt ?? new Date().toISOString(),
      joinedTeams: session?.joinedTeams ?? []
    };

    persistSession(nextSession);
    setPassword("");
    setLoginMessage({ tone: "success", text: `Signed in as ${normalizedEmail}.` });
  }

  function onLogout() {
    persistSession(null);
    setPassword("");
    setJoinCode("");
    setLoginMessage({ tone: "success", text: "Signed out in this browser." });
    setJoinMessage(null);
  }

  function onJoinSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!session) {
      setJoinMessage({ tone: "error", text: "Log in before joining a team." });
      return;
    }

    const normalizedCode = normalizePreviewTeamCode(joinCode);

    if (normalizedCode.length !== 6) {
      setJoinMessage({ tone: "error", text: "Team codes must be exactly 6 digits." });
      return;
    }

    const joinedTeam = resolveJoinedTeamFromCode(normalizedCode);
    const alreadyJoined = session.joinedTeams.some(
      (team) => team.code === joinedTeam.code || team.handle === joinedTeam.handle
    );

    if (alreadyJoined) {
      setJoinMessage({
        tone: "success",
        text: `${joinedTeam.title} is already attached to this browser session.`
      });
      return;
    }

    const nextSession: PreviewSession = {
      ...session,
      joinedTeams: [...session.joinedTeams, joinedTeam]
    };

    persistSession(nextSession);
    setJoinCode("");
    setJoinMessage({
      tone: "success",
      text: `${joinedTeam.title} was added. It is now available in the upload publisher dropdown.`
    });
  }

  return (
    <div className="two-column account-grid">
      <section className="panel account-panel">
        <div className="page-stack">
          <p className="eyebrow">Sign In</p>
          <h3>Personal account first</h3>
          <p>
            Log in before joining a team or publishing under a team profile. This preview keeps the
            session in your current browser.
          </p>
        </div>

        <form className="upload-form" onSubmit={onLoginSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="mentor@team.org"
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
            />
          </label>
          <div className="filter-actions">
            <button type="submit">Log in</button>
            {session ? (
              <button type="button" className="action-link" onClick={onLogout}>
                Log out
              </button>
            ) : null}
          </div>
        </form>

        {loginMessage ? <p className={toneClassName(loginMessage)}>{loginMessage.text}</p> : null}

        {session ? (
          <div className="account-session-card">
            <strong>Signed in as</strong>
            <span>{session.email}</span>
            <small>
              Joined {new Date(session.signedInAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </small>
          </div>
        ) : null}
      </section>

      <section className="panel account-panel">
        <div className="page-stack">
          <p className="eyebrow">Team Access</p>
          <h3>Join a team with a 6-digit code</h3>
          <p>
            Use a team code after logging in. Any joined team will show up as a publisher option on
            the upload page.
          </p>
        </div>

        <form className="upload-form" onSubmit={onJoinSubmit}>
          <label>
            Team code
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={joinCode}
              onChange={(event) => setJoinCode(normalizePreviewTeamCode(event.target.value))}
              placeholder="000031"
            />
          </label>
          <div className="filter-actions">
            <button type="submit">Join team</button>
          </div>
        </form>

        {joinMessage ? <p className={toneClassName(joinMessage)}>{joinMessage.text}</p> : null}

        <div className="account-code-list">
          <strong>Example codes</strong>
          <div className="chip-row">
            {previewJoinCodeExamples.map((team) => (
              <span key={team.code} className="chip">
                {team.code} - {team.title}
              </span>
            ))}
          </div>
        </div>

        <div className="account-team-list">
          <strong>Joined teams</strong>
          {session?.joinedTeams.length ? (
            session.joinedTeams.map((team) => (
              <div key={`${team.handle}-${team.code}`} className="account-team-row">
                <strong>{team.title}</strong>
                <span>Code {team.code}</span>
              </div>
            ))
          ) : (
            <p className="muted">No team profiles are attached to this browser session yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
