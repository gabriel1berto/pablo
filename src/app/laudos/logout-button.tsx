"use client";

import { signOut } from "./actions";

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: 600, color: "var(--t4)",
          padding: "4px 0",
        }}
      >
        Sair
      </button>
    </form>
  );
}
