export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--bd)",
      background: "var(--bg1)",
      padding: "20px 24px",
    }}>
      <div style={{
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        fontSize: 11,
        color: "var(--t4)",
      }}>
        <a href="#" style={{ color: "var(--t4)", textDecoration: "none" }}>Termos</a>
        <span>·</span>
        <a href="mailto:contato@pabloapps.net" style={{ color: "var(--t4)", textDecoration: "none" }}>Contato</a>
        <span>·</span>
        <span>© 2026 Pablo</span>
      </div>
    </footer>
  );
}
