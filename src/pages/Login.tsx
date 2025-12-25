import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Lang = "hu" | "en";

const DEMO_EMAIL = "demo@cv-demo.app";
const DEMO_PASSWORD = "Demo1234!";

const copy = {
  hu: {
    title1: "Önéletrajz / Álláshirdetés",
    title2: "Kompatibilitás",
    subtitle: "Demo / Teszt belépés",
    email: "Email",
    password: "Jelszó",
    login: "Belépés",
    register: "Regisztráció",
    demo: "🚀 Belépés DEMO felhasználóval",
    successLogin: "Sikeres belépés. Demo mód aktív.",
    successRegister: "Regisztráció sikeres. Azonnal beléphetsz.",
    disclaimer:
      "Ez az alkalmazás demo / referencia projekt. Kérjük, ne adj meg valós személyes adatokat.",
    language: "Nyelv",
  },
  en: {
    title1: "CV / Job Description",
    title2: "Compatibility",
    subtitle: "Demo / Test login",
    email: "Email",
    password: "Password",
    login: "Sign in",
    register: "Sign up",
    demo: "🚀 Sign in with DEMO user",
    successLogin: "Login successful. Demo mode active.",
    successRegister: "Registration successful. You can sign in now.",
    disclaimer:
      "This application is a demo / reference project. Please do not enter real personal data.",
    language: "Language",
  },
};

export default function Login() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("hu");
  const t = copy[lang];

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleLogin() {
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(t.successLogin);
    setLoading(false);

    // kis delay UX miatt
    setTimeout(() => navigate("/dashboard", { replace: true }), 200);
  }

  async function handleRegister() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        is_admin: false,
      });
    }

    setMessage(t.successRegister);
    setLoading(false);
  }

  async function handleDemoLogin() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    await handleLogin();
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>
              {t.title1}
              <br />
              {t.title2}
            </h1>
            <p style={styles.subtitle}>{t.subtitle}</p>
          </div>

          <button
            style={styles.langBtn}
            onClick={() => setLang(lang === "hu" ? "en" : "hu")}
          >
            {t.language}: {lang.toUpperCase()}
          </button>
        </div>

        <input
          style={styles.input}
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={styles.input}
          type="password"
          placeholder={t.password}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          style={styles.primaryBtn}
          onClick={handleLogin}
          disabled={loading}
        >
          {t.login}
        </button>

        <button
          style={styles.secondaryBtn}
          onClick={handleRegister}
          disabled={loading}
        >
          {t.register}
        </button>

        <button
          style={styles.demoBtn}
          onClick={handleDemoLogin}
          disabled={loading}
        >
          {t.demo}
        </button>

        {message && <p style={styles.message}>{message}</p>}

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
    width: 420,
    padding: 28,
    borderRadius: 16,
    background: "rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    color: "#fff",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 12,
  },
  title: {
    margin: 0,
    lineHeight: 1.15,
  },
  subtitle: {
    opacity: 0.85,
    marginTop: 6,
  },
  langBtn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.4)",
    background: "transparent",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    height: "fit-content",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    marginBottom: 12,
    borderRadius: 10,
    border: "none",
    outline: "none",
  },
  primaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#00c6ff",
    color: "#001018",
    fontWeight: 800,
    marginBottom: 8,
    cursor: "pointer",
  },
  secondaryBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.4)",
    background: "transparent",
    color: "#fff",
    marginBottom: 8,
    cursor: "pointer",
  },
  demoBtn: {
    width: "100%",
    padding: 12,
    borderRadius: 10,
    border: "none",
    background: "#00ffcc",
    color: "#003333",
    fontWeight: 800,
    marginBottom: 12,
    cursor: "pointer",
  },
  message: {
    marginTop: 10,
    fontSize: 14,
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.65,
    lineHeight: 1.4,
  },
};
