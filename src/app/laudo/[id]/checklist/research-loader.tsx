"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FACTS = [
  { text: "O câmbio automático do HB20 pode dar solavancos após 60 mil km — é um ponto comum de atenção.", tag: "Curiosidade" },
  { text: "Pneus com desgaste irregular quase sempre indicam suspensão desalinhada, não pneu ruim.", tag: "Dica" },
  { text: "O ruído de correia dentada costuma aparecer na partida a frio. Se parar após aquecer, a troca é urgente.", tag: "Sinal" },
  { text: "Verificar o óleo do câmbio é tão importante quanto o do motor — e quase ninguém faz.", tag: "Dica" },
  { text: "Carro que ficou muito parado pode ter mais problemas que um rodado. Borrachas ressecam, freios travam.", tag: "Mito x Fato" },
  { text: "A FIPE é uma média. Carros com revisão em dia e documentação limpa valem acima dela.", tag: "Negociação" },
  { text: "Fumaça branca no escapamento pode ser só condensação. Fumaça azulada é sinal de queima de óleo.", tag: "Diagnóstico" },
  { text: "Volante que puxa para um lado pode ser alinhamento — ou pode ser pinça de freio travada.", tag: "Sinal" },
  { text: "Um carro batido e bem reparado pode ser melhor negócio que um nunca batido e mal conservado.", tag: "Negociação" },
  { text: "Barulho ao passar em lombada geralmente é bucha de bandeja — reparo barato mas ignorado.", tag: "Diagnóstico" },
  { text: "Ar-condicionado fraco nem sempre é gás. Pode ser condensador sujo — limpeza custa ~R$ 80.", tag: "Economia" },
  { text: "Carros flex rendem mais com etanol só se o preço for até 70% do valor da gasolina.", tag: "Dica" },
];

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
  const [factIdx, setFactIdx] = useState(() => Math.floor(Math.random() * FACTS.length));
  const [fade, setFade] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const key = `researched_${brand}_${model}_${year}`;
    if (sessionStorage.getItem(key)) {
      router.refresh();
      return;
    }
    sessionStorage.setItem(key, "1");
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

  // Rotate facts
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFactIdx((prev) => (prev + 1) % FACTS.length);
        setFade(true);
      }, 300);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  // Progress bar
  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => Math.min(p + 0.5, 95));
    }, 100);
    return () => clearInterval(t);
  }, []);

  const fact = FACTS[factIdx];

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: 340, gap: 20, textAlign: "center",
      padding: "0 8px",
    }}>
      {/* Animated car icon */}
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: "var(--ag)", border: "1px solid rgba(0,212,170,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, animation: "pulse 2s ease-in-out infinite",
      }}>
        🔍
      </div>

      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: "var(--t1)", marginBottom: 6 }}>
          Analisando o {model}
        </div>
        <div style={{ fontSize: 13, color: "var(--t3)", lineHeight: 1.5 }}>
          Buscando pontos críticos para {km.toLocaleString("pt-BR")} km
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        width: "100%", maxWidth: 220, height: 4,
        background: "var(--bg3)", borderRadius: 99, overflow: "hidden",
      }}>
        <div style={{
          height: "100%", background: "var(--accent)", borderRadius: 99,
          width: `${progress}%`, transition: "width 0.1s linear",
        }} />
      </div>

      {/* Fact card */}
      <div style={{
        background: "var(--bg2)", border: "1px solid var(--bd)",
        borderRadius: "var(--rm)", padding: "14px 18px",
        maxWidth: 340, width: "100%",
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(6px)",
        transition: "opacity 0.3s, transform 0.3s",
      }}>
        <span style={{
          fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99,
          background: "var(--ag)", color: "var(--accent)",
          letterSpacing: "0.5px", textTransform: "uppercase",
        }}>
          {fact.tag}
        </span>
        <div style={{ fontSize: 13, color: "var(--t2)", lineHeight: 1.6, marginTop: 8 }}>
          {fact.text}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
      `}</style>
    </div>
  );
}
