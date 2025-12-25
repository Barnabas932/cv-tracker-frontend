import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

type Profile = {
  id: string;
  email: string;
  created_at?: string;
};

export default function Admin() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, email, created_at")
      .order("email");

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: 32 }}>
      <h1>Admin / Demo panel</h1>

      <p style={{ maxWidth: 600 }}>
        Ez egy <b>demo / referencia projekt</b>.  
        Az adminisztrátori jóváhagyás ebben a módban ki van kapcsolva.
        Az alábbi lista kizárólag tájékoztató jellegű.
      </p>

      {loading && <p>Betöltés...</p>}

      {!loading && users.length === 0 && (
        <p>Nincs regisztrált felhasználó</p>
      )}

      {!loading && users.length > 0 && (
        <table style={{ width: "100%", marginTop: 24 }}>
          <thead>
            <tr>
              <th align="left">Email</th>
              <th align="left">Regisztráció ideje</th>
              <th align="left">Státusz</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleString()
                    : "-"}
                </td>
                <td>Demo mód (aktív)</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
