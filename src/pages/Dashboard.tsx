import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { scoreMatch } from "../lib/match";

type Profile = {
  id: string;
  email: string | null;
  is_admin: boolean;
};

type Lang = "hu" | "en";

const copy = {
  hu: {
    dashboard: "Dashboard",
    loggedInAs: "Bejelentkezve:",
    logout: "Kijelentkezés",
    admin: "Admin",
    loading: "Betöltés...",
    demoFiles: "Demo fájlok",
    demoFilesDesc:
      "Letölthető minta önéletrajz és álláshirdetés (PDF). Ezeket használhatod tesztelésre.",
    downloadCV: "📄 Demo CV letöltése",
    downloadJob: "📄 Demo álláshirdetés letöltése",
    textTest: "Szöveges teszt",
    textTestDesc:
      "Illeszd be a CV szövegét és az álláshirdetés szövegét, majd számoljunk kompatibilitást.",
    cvLabel: "CV szöveg",
    cvPlaceholder: "Másold be ide az önéletrajz szövegét...",
    jobLabel: "Álláshirdetés szöveg",
    jobPlaceholder: "Másold be ide az álláshirdetés szövegét...",
    calc: "🔎 Kompatibilitás számítása",
    tip: "Tipp: legalább ~50 karakter legyen mindkét mezőben.",
    result: "Eredmény",
    compatibility: "Kompatibilitás",
    scoreHint:
      "Ez most egy egyszerű demó-értékelés kulcsszavak alapján. Az AI-alapú verzió a következő lépés.",
    strengths: "Erősségek",
    gaps: "Hiányok / javaslatok",
    noStrengths: "Nincs kiemelhető találat.",
    noGaps: "Nem találtunk jelentős hiányt.",
    keywords: "Talált kulcsszavak",
    disclaimer:
      "Ez az alkalmazás demo / referencia projekt. Kérjük, ne adj meg valós személyes adatokat.",
    language: "Nyelv",
    noEmail: "(nincs email)",
  },
  en: {
    dashboard: "Dashboard",
    loggedInAs: "Logged in as:",
    logout: "Sign out",
    admin: "Admin",
    loading: "Loading...",
    demoFiles: "Demo files",
    demoFilesDesc:
      "Downloadable sample CV and job description (PDF). Use these for testing.",
    downloadCV: "📄 Download demo CV",
    downloadJob: "📄 Download demo job description",
    textTest: "Text-based test",
    textTestDesc:
      "Paste the CV text and the job description text, then calculate compatibility.",
    cvLabel: "CV text",
    cvPlaceholder: "Paste the CV text here...",
    jobLabel: "Job description text",
    jobPlaceholder: "Paste the job description text here...",
    calc: "🔎 Calculate compatibility",
    tip: "Tip: use at least ~50 characters in both fields.",
    result: "Result",
    compatibility: "Compatibility",
    scoreHint:
      "This is a simple demo scoring based on keywords. AI-based scoring comes next.",
    strengths: "Strengths",
    gaps: "Gaps / suggestions",
    noStrengths: "No notable matches found.",
    noGaps: "No major gaps found.",
    keywords: "Detected keywords",
    disclaimer:
      "This application is a demo / reference project. Please do not enter real personal data.",
    language: "Language",
    noEmail: "(no email)",
  },
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("hu");
  const t = copy[lang];

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [cvText, setCvText] = useState("");
  const [jobText, setJobText] = useState("");

  const [result, setResult] = useState<{
    score: number;
    strengths: string[];
    gaps: string[];
    keywords: string[];
  } | null>(null);

  const DEMO_CV_URL = "/demo/Demo_CV_Teszt_Elek.pdf";
  const DEMO_JOB_URL = "/demo/Demo_Allashirdetes_Junior_Fullstack.pdf";

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData, error: sErr } = await supabase.auth.getSession();
      if (sErr) {
        if (!cancelled) setError(sErr.message);
        if (!cancelled) setLoading(false);
        return;
      }

      const session = sessionData.session;
      if (!session) {
        navigate("/login", { replace: true });
        return;
      }

      const userId = session.user.id;

      // Profil betöltés – ha nincs még profiles sor, ne dőljön el az egész app
      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("id,email,is_admin")
        .eq("id", userId)
        .single();

      if (pErr) {
        // fallback: legalább emailt mutassunk session-ből
        if (!cancelled) {
          setProfile({
            id: userId,
            email: session.user.email ?? null,
            is_admin: false,
          });
          setError(null);
        }
      } else {
        if (!cancelled) setProfile(pData);
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  const canScore = useMemo(() => {
    return cvText.trim().length >= 50 && jobText.trim().length >= 50;
  }, [cvText, jobText]);

  function runScoring() {
    setResult(scoreMatch(cvText, jobText));
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={{ opacity: 0.8 }}>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>{t.dashboard}</h1>
            <p style={styles.subtitle}>
              {t.loggedInAs}{" "}
              <b>{profile?.email ?? t.noEmail}</b>
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              style={styles.ghostBtn}
              onClick={() => setLang((prev) => (prev === "hu" ? "en" : "hu"))}
            >
              {t.language}: {lang.toUpperCase()}
            </button>

            {profile?.is_admin && (
              <button style={styles.ghostBtn} onClick={() => navigate("/admin")}>
                {t.admin}
              </button>
            )}

            <button style={styles.ghostBtn} onClick={signOut}>
              {t.logout}
            </button>
          </div>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t.demoFiles}</h2>
          <p style={styles.smallText}>{t.demoFilesDesc}</p>

          <div style={styles.linkRow}>
            <a style={styles.linkBtn} href={DEMO_CV_URL} target="_blank" rel="noreferrer">
              {t.downloadCV}
            </a>
            <a style={styles.linkBtn} href={DEMO_JOB_URL} target="_blank" rel="noreferrer">
              {t.downloadJob}
            </a>
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>{t.textTest}</h2>
          <p style={styles.smallText}>{t.textTestDesc}</p>

          <label style={styles.label}>{t.cvLabel}</label>
          <textarea
            style={styles.textarea}
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder={t.cvPlaceholder}
          />

          <label style={styles.label}>{t.jobLabel}</label>
          <textarea
            style={styles.textarea}
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder={t.jobPlaceholder}
          />

          <button
            style={{
              ...styles.primaryBtn,
              opacity: canScore ? 1 : 0.5,
              cursor: canScore ? "pointer" : "not-allowed",
            }}
            disabled={!canScore}
            onClick={runScoring}
          >
            {t.calc}
          </button>

          {!canScore && <p style={styles.smallText}>{t.tip}</p>}
        </div>

        {result && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>{t.result}</h2>

            <div style={styles.scoreBox}>
              <div style={{ fontSize: 14, opacity: 0.8 }}>{t.compatibility}</div>
              <div style={styles.scoreNumber}>{result.score}%</div>
              <div style={styles.scoreHint}>{t.scoreHint}</div>
            </div>

            <div style={styles.grid}>
              <div style={styles.box}>
                <h3 style={styles.boxTitle}>{t.strengths}</h3>
                {result.strengths.length ? (
                  <ul style={styles.ul}>
                    {result.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.smallText}>{t.noStrengths}</p>
                )}
              </div>

              <div style={styles.box}>
                <h3 style={styles.boxTitle}>{t.gaps}</h3>
                {result.gaps.length ? (
                  <ul style={styles.ul}>
                    {result.gaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                ) : (
                  <p style={styles.smallText}>{t.noGaps}</p>
                )}
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={{ ...styles.smallText, marginBottom: 6 }}>{t.keywords}:</div>
              <div style={styles.keywordWrap}>
                {result.keywords.map((k) => (
                  <span key={k} style={styles.keyword}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <p style={styles.disclaimer}>{t.disclaimer}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg,#0f2027,#203a43,#2c5364)",
    padding: 16,
  },
  card: {
    width: 900,
    maxWidth: "100%",
    padding: 28,
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    color: "#fff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  headerRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  title: { margin: 0, lineHeight: 1.1 },
  subtitle: { opacity: 0.85, marginTop: 6, marginBottom: 0 },

  section: {
    marginTop: 18,
    paddingTop: 16,
    borderTop: "1px solid rgba(255,255,255,0.15)",
  },
  sectionTitle: { margin: "0 0 8px 0" },
  smallText: { opacity: 0.75, fontSize: 13, lineHeight: 1.5 },

  label: { display: "block", marginTop: 10, marginBottom: 6, opacity: 0.9 },
  textarea: {
    width: "100%",
    minHeight: 120,
    resize: "vertical",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    outline: "none",
    marginBottom: 10,
  },

  linkRow: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 },
  linkBtn: {
    display: "inline-block",
    padding: "10px 12px",
    borderRadius: 10,
    background: "rgba(0,198,255,0.18)",
    border: "1px solid rgba(0,198,255,0.35)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
  },

  primaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#00c6ff",
    color: "#001018",
    fontWeight: 800,
    marginTop: 8,
  },
  ghostBtn: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
  },
  error: { color: "#ffb4b4", marginTop: 10 },

  scoreBox: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  scoreNumber: { fontSize: 44, fontWeight: 900, marginTop: 6 },
  scoreHint: { opacity: 0.75, fontSize: 12, lineHeight: 1.4, marginTop: 6 },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 12,
  },
  box: {
    padding: 14,
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  boxTitle: { marginTop: 0 },
  ul: { margin: 0, paddingLeft: 18 },

  keywordWrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  keyword: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(0,255,204,0.18)",
    border: "1px solid rgba(0,255,204,0.35)",
    fontSize: 12,
    fontWeight: 700,
  },

  disclaimer: {
    marginTop: 18,
    fontSize: 12,
    opacity: 0.6,
    lineHeight: 1.4,
  },
};
