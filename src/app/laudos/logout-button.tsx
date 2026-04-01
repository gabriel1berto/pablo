"use client";

import { signOut } from "./actions";

export default function LogoutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: 600, color: "var(--danger)",
          padding: "4px 8px", borderRadius: 6,
          textDecoration: "underline", textUnderlineOffset: "2px",
        }}
      >
        Sair
      </button>
    </form>
  );
}
