import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

type Profile = {
  id: string;
  email: string | null;
  is_approved: boolean;
  is_admin: boolean;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) return navigate("/login");

      const userId = session.user.id;

      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,is_approved,is_admin")
        .eq("id", userId)
        .single();

      if (error) return setError(error.message);

      setProfile(data);

      if (!data.is_approved) navigate("/waiting");
    })();
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {profile && (
        <>
          <p>
            Bejelentkezve: <b>{profile.email}</b>
          </p>
          <p>
            Approved: <b>{String(profile.is_approved)}</b>
          </p>

          {profile.is_admin && (
            <button onClick={() => navigate("/admin")}>Admin panel</button>
          )}

          <div style={{ marginTop: 16 }}>
            <button onClick={signOut}>Kijelentkezés</button>
          </div>
        </>
      )}
    </div>
  );
}
