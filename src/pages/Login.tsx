import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const emailOk = useMemo(() => email.includes("@") && email.includes("."), [email]);
  const pwOk = useMemo(() => password.length >= 6, [password]);

  async function handleSubmit() {
    setError(null);

    if (!emailOk) return setError("Kérlek adj meg egy érvényes e-mail címet.");
    if (!pwOk) return setError("A jelszó legalább 6 karakter legyen.");

    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // Ha email confirmation ON, akkor a user e-mailben kap linket.
        // Ha OFF, akkor azonnal tud belépni.
        alert("Sikeres regisztráció! (Lehet, hogy e-mailben meg kell erősítened.)");
        navigate("/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? "Ismeretlen hiba történt.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.bgGlow} />

      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo} aria-hidden>
            CV
          </div>
          <div>
            <h1 style={styles.title}>CV Tracker</h1>
            <p style={styles.subtitle}>
              AI-asszisztált (demo) CV & állás illeszkedés – regisztráció jóváhagyással.
            </p>
          </div>
        </div>

        <div style={styles.tabs}>
          <button
            type="button"
            onClick={() => setMode("signin")}
            style={{
              ...styles.tabBtn,
              ...(mode === "signin" ? styles.tabActive : {})
            }}
          >
            Belépés
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              ...styles.tabBtn,
              ...(mode === "signup" ? styles.tabActive : {})
            }}
          >
            Regisztráció
          </button>
        </div>

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            placeholder="pl. te@pelda.hu"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())}
            autoComplete="email"
            inputMode="email"
          />
        </label>

        <label style={styles.label}>
          Jelszó
          <input
            style={styles.input}
            placeholder="legalább 6 karakter"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
        </label>

        {error && <div style={styles.errorBox}>{error}</div>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={busy}
          style={{
            ...styles.primaryBtn,
            ...(busy ? styles.btnDisabled : {})
          }}
        >
          {busy ? "Kérlek várj..." : mode === "signin" ? "Belépés" : "Regisztráció küldése"}
        </button>

        <div style={styles.note}>
          <b>Demo / portfólió alkalmazás:</b> kérlek ne tölts fel valós személyes adatokat.
          Használj anonimizált teszt CV-t és állásleírást. A regisztráció jóváhagyás után aktív.
        </div>

        <div style={styles.footer}>
          <span style={{ opacity: 0.8 }}>Supabase Auth • Replit deploy</span>
          <span style={{ opacity: 0.8 }}>v0.1</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 18,
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(0, 255, 170, 0.10), transparent 55%)," +
      "radial-gradient(900px 500px at 90% 20%, rgba(140, 100, 255, 0.14), transparent 60%)," +
      "linear-gradient(180deg, #0b0c10 0%, #0f1220 100%)",
    color: "#e9ecf1",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, Arial, sans-serif'
  },
  bgGlow: {
    position: "fixed",
    inset: 0,
    pointerEvents: "none",
    background:
      "radial-gradient(600px 400px at 50% 35%, rgba(255,255,255,0.06), transparent 60%)"
  },
  card: {
    width: "min(460px, 96vw)",
    borderRadius: 18,
    padding: 18,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.40)",
    backdropFilter: "blur(10px)"
  },
  header: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 12
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
    letterSpacing: 0.5,
    background: "linear-gradient(135deg, rgba(0,255,170,0.35), rgba(140,100,255,0.35))",
    border: "1px solid rgba(255,255,255,0.14)"
  },
  title: {
    margin: 0,
    fontSize: 20,
    lineHeight: 1.2
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: 13,
    opacity: 0.82
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginTop: 10,
    marginBottom: 12
  },
  tabBtn: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.18)",
    color: "#e9ecf1",
    fontWeight: 700,
    cursor: "pointer"
  },
  tabActive: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)"
  },
  label: {
    display: "grid",
    gap: 6,
    fontSize: 13,
    opacity: 0.9,
    marginTop: 10
  },
  input: {
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.20)",
    color: "#e9ecf1",
    outline: "none"
  },
  errorBox: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255, 80, 80, 0.35)",
    background: "rgba(255, 80, 80, 0.12)",
    color: "#ffd6d6",
    fontSize: 13
  },
  primaryBtn: {
    marginTop: 14,
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "linear-gradient(135deg, rgba(0,255,170,0.35), rgba(140,100,255,0.35))",
    color: "#0b0c10",
    fontWeight: 900,
    cursor: "pointer"
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed"
  },
  note: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 1.45,
    opacity: 0.78,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.14)"
  },
  footer: {
    marginTop: 12,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 12
  }
};
