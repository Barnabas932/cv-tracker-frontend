import { supabase } from "../supabaseClient";

export default function WaitingApproval() {
  return (
    <div style={{ padding: 32 }}>
      <h1>Információ</h1>
      <p>Ez a demó verzióban nem használt oldal.</p>
      <button onClick={() => supabase.auth.signOut()}>Kijelentkezés</button>
    </div>
  );
}
