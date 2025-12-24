import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function signIn() {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setError(error.message);
    navigate("/dashboard");
  }

  async function signUp() {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setError(error.message);
    alert("Sikeres regisztráció! Jóváhagyásra vársz.");
    navigate("/dashboard");
  }

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Belépés / Regisztráció</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      <input
        placeholder="Jelszó"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      />

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button onClick={signIn}>Belépés</button>
        <button onClick={signUp}>Regisztráció</button>
      </div>
    </div>
  );
}
