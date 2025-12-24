import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function WaitingApproval() {
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Jóváhagyásra vársz</h2>
      <p>
        A fiókod létrejött, de admin jóváhagyás szükséges a CV és állásleírás feltöltéséhez.
      </p>
      <button onClick={signOut}>Kijelentkezés</button>
    </div>
  );
}
