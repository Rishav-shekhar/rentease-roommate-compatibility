"use client";

import { useEffect, useMemo, useState } from "react";
import AdSlot from "@/components/AdSlot";
import { quoteForSeed } from "@/lib/facts";
import {
  Answers,
  QUESTIONS,
  decodeAnswers,
  encodeAnswers,
  interpretation,
  scoreCompatibility,
} from "@/lib/quiz";

type View = "landing" | "quiz" | "invite" | "results";

export default function Page() {
  const [view, setView] = useState<View>("landing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [partnerA, setPartnerA] = useState<Answers | null>(null);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin + window.location.pathname);

    const params = new URLSearchParams(window.location.search);

    const a = decodeAnswers(params.get("a"));
    const b = decodeAnswers(params.get("b"));

    if (a && b) {
      setPartnerA(a);
      setAnswers(b);
      setView("results");
    } else if (a) {
      setPartnerA(a);
      setView("landing");
    }
  }, []);

  const isInviteFlow = partnerA !== null && view !== "results";

  const viewSeed = view === "quiz" ? step + 1 : view.length;

  const quote = useMemo(
    () => quoteForSeed(viewSeed),
    [viewSeed]
  );

  const result = useMemo(() => {
    if (view !== "results" || !partnerA) {
      return null;
    }

    return scoreCompatibility(partnerA, answers);
  }, [view, partnerA, answers]);

  function startQuiz() {
    setStep(0);
    setAnswers({});
    setView("quiz");
  }

  function selectOption(value: number) {
    const question = QUESTIONS[step];

    const nextAnswers = {
      ...answers,
      [question.id]: value,
    };

    setAnswers(nextAnswers);

    if (step < QUESTIONS.length - 1) {
      setTimeout(() => {
        setStep(step + 1);
      }, 160);
    } else {
      setTimeout(() => {
        if (partnerA) {
          const params = new URLSearchParams();

          params.set("a", encodeAnswers(partnerA));
          params.set("b", encodeAnswers(nextAnswers));

          window.history.replaceState(
            null,
            "",
            `?${params.toString()}`
          );

          setView("results");
        } else {
          setView("invite");
        }
      }, 160);
    }
  }

  function goBack() {
    if (step > 0) {
      setStep(step - 1);
    } else {
      setView("landing");
    }
  }

  const inviteLink = useMemo(() => {
    if (!origin) {
      return "";
    }

    const params = new URLSearchParams();

    params.set("a", encodeAnswers(answers));

    return `${origin}?${params.toString()}`;
  }, [origin, answers]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  }

  async function shareInvite() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Roommate Compatibility Test",
          text:
            "I took the RentEase Roommate Compatibility Test. Take yours and let's see how compatible we are.",
          url: inviteLink,
        });

        return;
      } catch {
        // User cancelled the native share sheet.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  }

  async function shareResult() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Our roommate compatibility score",
          url,
        });

        return;
      } catch {
        // User cancelled the native share sheet.
      }
    }

    try {
      await navigator.clipboard.writeText(url);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      // Clipboard unavailable.
    }
  }

  function restart() {
    window.history.replaceState(
      null,
      "",
      window.location.pathname
    );

    setPartnerA(null);
    setAnswers({});
    setStep(0);
    setView("landing");
  }

  return (
    <div className="app-shell">

      {/* Desktop brand panel */}
      <aside className="brand-panel">
        <a
          href="https://rentease.in"
          target="_blank"
          rel="noopener noreferrer"
          className="brand-panel-top"
          aria-label="Go to RentEase home"
        >
          <img
            src="/rentease-logo.jpg"
            alt="RentEase"
            className="brand-panel-logo"
          />

          <span>RentEase</span>
        </a>

        <div className="brand-panel-quote">
          <span
            className="quote-mark"
            aria-hidden="true"
          >
            “
          </span>

          <p>{quote}</p>
        </div>

        <p className="brand-panel-foot">
          Built for people about to share a kitchen.
        </p>

        <div className="coming-soon">
          <span className="coming-soon-label">Coming soon</span>

          <p className="coming-soon-title">RentEase Living</p>

          <p className="coming-soon-tagline">
            Your next home. Your next roommate. One search.
          </p>

          <p className="coming-soon-categories">
            Homes for rent · Homes for sale · Rooms · Roommates ·
            People to live with · Tenant connections
          </p>

          <span className="coming-soon-powered">Powered by RentEase</span>
        </div>

        <p className="brand-panel-copyright">
          © 2026 RentEase. All rights reserved.
        </p>
      </aside>

      {/* Main content */}
      <div className="content-panel">
        <div className="shell">

          {/* Mobile brand */}
         <a
           href="https://rentease.in"
           target="_blank"
           rel="noopener noreferrer"
           className="brand mobile-brand"
           aria-label="Go to RentEase home"
         >
            <img
              src="/rentease-logo.jpg"
              alt="RentEase"
              className="brand-logo"
            />

            <b>RentEase</b> · free tool
          </a>

          {/* LANDING */}
          {view === "landing" && (
            <div className="landing">

              <h1 className="display">
                {isInviteFlow
                  ? "Someone wants to know if you'd survive living together."
                  : "Would you actually survive living together?"}
              </h1>

              <p className="sub">
                {isInviteFlow
                  ? "They already answered their side. Take the 2-minute test and see your compatibility score."
                  : "A 2-minute lifestyle check for you and a potential roommate — sleep, mess, noise, guests, and the rest."}
              </p>

              <div className="pill-row">
                <span className="pill">
                  10 questions
                </span>

                <span className="pill">
                  No sign-up
                </span>

                <span className="pill">
                  2 minutes
                </span>
              </div>

              <button
                className="cta"
                onClick={startQuiz}
              >
                Start the test
              </button>

            </div>
          )}

          {/* QUIZ */}
          {view === "quiz" && (
            <div className="question-wrap">

              <div className="quiz-head">

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        ((step + 1) /
                          QUESTIONS.length) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <span className="progress-count">
                  {step + 1} / {QUESTIONS.length}
                </span>

              </div>

              <h2
                className="question-prompt"
                key={QUESTIONS[step].id}
              >
                {QUESTIONS[step].prompt}
              </h2>

              <div className="options">
                {QUESTIONS[step].options.map(
                  (option) => (
                    <button
                      key={option.value}
                      className={`option-btn${
                        answers[
                          QUESTIONS[step].id
                        ] === option.value
                          ? " selected"
                          : ""
                      }`}
                      onClick={() =>
                        selectOption(
                          option.value
                        )
                      }
                    >
                      {option.label}
                    </button>
                  )
                )}
              </div>

              <button
                className="back-link"
                onClick={goBack}
              >
                ← Back
              </button>

            </div>
          )}

          {/* INVITE */}
          {view === "invite" && (
            <div
              className="landing"
              style={{
                paddingTop: 24,
              }}
            >

              <div className="card">

                <div className="invite-icon">
                  🔗
                </div>

                <h2
                  className="display"
                  style={{
                    fontSize: 24,
                    marginBottom: 8,
                  }}
                >
                  Now send this to them
                </h2>

                <p
                  className="sub"
                  style={{
                    marginBottom: 0,
                  }}
                >
                  Your answers are saved in the
                  link. Once they finish, you'll
                  both see the score.
                </p>

                <div className="link-box">
                  <span>{inviteLink}</span>
                </div>

                <div className="result-actions">

                  <button
                    className="cta ghost"
                    onClick={copyLink}
                  >
                    {copied
                      ? "Copied!"
                      : "Copy invite link"}
                  </button>

                  <button
                    className="cta"
                    onClick={shareInvite}
                  >
                    Share invite
                  </button>

                </div>

              </div>

              <button
                className="cta ghost"
                onClick={restart}
              >
                Start over
              </button>

            </div>
          )}

          {/* RESULTS */}
          {view === "results" && result && (
            <div>

              <div className="score-hero">

                <div
                  className="score-ring"
                  style={{
                    ["--pct" as any]:
                      `${result.percent}%`,
                  }}
                >

                  <div className="score-ring-inner">

                    <div className="score-num">
                      {result.percent}%
                    </div>

                    <div className="score-label">
                      Compatible
                    </div>

                  </div>

                </div>

                <p className="interp">
                  {interpretation(
                    result.percent
                  )}
                </p>

              </div>

              {/* Strong matches */}
              {result.strong.length > 0 && (
                <>
                  <div className="section-title">
                    Strong matches{" "}
                    <span className="section-hint">
                      — close or identical answers
                    </span>
                  </div>

                  {result.strong.map((r) => (
                    <div
                      className="result-row"
                      key={r.question.id}
                    >

                      <div className="row-left">

                        <span
                          className="row-icon good"
                          aria-hidden="true"
                        >
                          ✓
                        </span>

                        <span>
                          {r.question.prompt}
                        </span>

                      </div>

                      <span className="row-pct good">
                        {r.match}%
                      </span>

                    </div>
                  ))}
                </>
              )}

              {/* Potential friction */}
              {result.friction.length > 0 && (
                <>
                  <div className="section-title">
                    Potential friction{" "}
                    <span className="section-hint">
                      — worth a quick chat
                    </span>
                  </div>

                  {result.friction.map((r) => (
                    <div
                      className="result-row"
                      key={r.question.id}
                    >

                      <div className="row-left">

                        <span
                          className="row-icon friction"
                          aria-hidden="true"
                        >
                          !
                        </span>

                        <span>
                          {r.question.prompt}
                        </span>

                      </div>

                      <span className="row-pct friction">
                        {r.match}%
                      </span>

                    </div>
                  ))}
                </>
              )}

              {/* Result actions */}
              <div className="result-actions">

                <button
                  className="cta ghost"
                  onClick={restart}
                >
                  Restart
                </button>

                <button
                  className="cta"
                  onClick={shareResult}
                >
                  {copied
                    ? "Copied!"
                    : "Share result"}
                </button>

              </div>

              <p className="footer-note">
                Made with RentEase
              </p>

            </div>
          )}

          {/* Coming Soon — mobile version (desktop shows this in the brand panel) */}
          <div className="coming-soon coming-soon-mobile">
            <span className="coming-soon-label">Coming soon</span>

            <p className="coming-soon-title">RentEase Living</p>

            <p className="coming-soon-tagline">
              Your next home. Your next roommate. One search.
            </p>

            <p className="coming-soon-categories">
              Homes for rent · Homes for sale · Rooms · Roommates ·
              People to live with · Tenant connections
            </p>

            <span className="coming-soon-powered">Powered by RentEase</span>

            <p className="brand-panel-copyright" style={{ marginTop: 12 }}>
              © 2026 RentEase. All rights reserved.
            </p>
          </div>

          {/* ONE GLOBAL ADSENSE AD */}
          <div className="global-ad">
            <AdSlot />
          </div>

        </div>
      </div>

    </div>
  );
}