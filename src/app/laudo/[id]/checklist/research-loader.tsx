"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResearchLoader({
  brand,
  model,
  year,
  km,
}: {
  brand: string;
  model: string;
  year: number;
  km: number;
}) {
  const router = useRouter();
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const key = `researched_${brand}_${model}_${year}`;

    // Já tentou nessa sessão?
    if (sessionStorage.getItem(key)) {
      router.refresh();
      return;
    }

    sessionStorage.setItem(key, "1");

    // Timeout de segurança: se a pesquisa demorar mais de 25s, avança mesmo assim
    const timeout = setTimeout(() => router.refresh(), 25000);

    fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brand, model, year, km }),
    }).finally(() => {
      clearTimeout(timeout);
      router.refresh();
    });
  }, [brand, model, year, km, router]);

  // Animação de dots
  useEffect(() => {
    const t = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      500
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 260,
        gap: 16,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          background: "var(--ag)",
          border: "1px solid rgba(0,212,170,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
        }}
      >
        🔍
      </div>
      <div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--t1)",
            marginBottom: 6,
          }}
        >
          Analisando o {brand} {model}{dots}
        </div>
        <div
          style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.6 }}
        >
          Buscando problemas conhecidos deste modelo.
          <br />
          Isso leva alguns segundos.
        </div>
      </div>
      <div
        style={{
          width: 180,
          height: 3,
          background: "var(--bg3)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            background: "var(--accent)",
            borderRadius: 99,
            animation: "progress 5s linear infinite",
          }}
        />
      </div>
      <style>{`
        @keyframes progress {
          0% { width: 0% }
          100% { width: 100% }
        }
      `}</style>
    </div>
  );
}
