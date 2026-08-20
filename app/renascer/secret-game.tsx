"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 540;
const MOVE_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"]);

type Position = { x: number; y: number };
type Facing = "up" | "down" | "left" | "right";
type GamePhase = "intro" | "playing" | "complete";
type Dialogue = {
  speaker: string;
  text: string;
  choices?: Array<{ label: string; answer: string }>;
};

const fragments = [
  { id: 1, x: 118, y: 142, name: "Curiosidade", text: "Uma pergunta bem feita ilumina o primeiro passo." },
  { id: 2, x: 482, y: 426, name: "Coragem", text: "Aprender também é tentar de novo por um caminho diferente." },
  { id: 3, x: 786, y: 405, name: "Comunidade", text: "Nenhuma história escolar é construída por uma pessoa só." },
];

const obstacles = [
  { x: 168, y: 130, w: 170, h: 58 },
  { x: 622, y: 130, w: 170, h: 58 },
  { x: 166, y: 346, w: 172, h: 58 },
  { x: 622, y: 346, w: 172, h: 58 },
  { x: 424, y: 222, w: 112, h: 88 },
  { x: 842, y: 174, w: 58, h: 188 },
];

function distance(a: Position, b: Position) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function collides(x: number, y: number) {
  if (x < 48 || x > WORLD_WIDTH - 48 || y < 102 || y > WORLD_HEIGHT - 42) return true;
  const body = { left: x - 13, right: x + 13, top: y - 33, bottom: y };
  return obstacles.some((item) => body.right > item.x && body.left < item.x + item.w && body.bottom > item.y && body.top < item.y + item.h);
}

function worldPosition(x: number, y: number) {
  return { left: `${(x / WORLD_WIDTH) * 100}%`, top: `${(y / WORLD_HEIGHT) * 100}%` };
}

export default function SecretGame() {
  const [accessReady, setAccessReady] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [position, setPosition] = useState<Position>({ x: 86, y: 456 });
  const [facing, setFacing] = useState<Facing>("up");
  const [walking, setWalking] = useState(false);
  const [collected, setCollected] = useState<number[]>([]);
  const [dialogue, setDialogue] = useState<Dialogue | null>(null);
  const [hint, setHint] = useState("Encontre os três fragmentos e desperte a porta azul.");
  const keysRef = useRef<Set<string>>(new Set());
  const collectedRef = useRef<number[]>([]);
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setAccessGranted(window.sessionStorage.getItem("duprat-secret-unlocked") === "true");
      setAccessReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    collectedRef.current = collected;
  }, [collected]);

  const collectNearby = useCallback((next: Position) => {
    const found = fragments.find((fragment) => !collectedRef.current.includes(fragment.id) && distance(next, fragment) < 36);
    if (!found) return;
    const nextCollected = [...collectedRef.current, found.id];
    collectedRef.current = nextCollected;
    setCollected(nextCollected);
    setHint(nextCollected.length === fragments.length ? "Os três fragmentos responderam. Volte à porta azul e pressione E." : `Fragmento ${nextCollected.length} de ${fragments.length} encontrado.`);
    setDialogue({ speaker: `Fragmento da ${found.name}`, text: found.text });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (MOVE_KEYS.has(key)) {
        event.preventDefault();
        keysRef.current.add(key);
      }
      if ((key === "e" || key === "Enter") && phase === "playing" && !dialogue) {
        event.preventDefault();
        interact();
      }
      if (key === "Escape" && dialogue) setDialogue(null);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      keysRef.current.delete(key);
    };
    const releaseKeys = () => keysRef.current.clear();
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseKeys);
    window.addEventListener("pointerup", releaseKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseKeys);
      window.removeEventListener("pointerup", releaseKeys);
    };
  });

  useEffect(() => {
    if (phase !== "playing" || dialogue) return;
    let animationFrame = 0;
    let previous = performance.now();
    const update = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.034);
      previous = now;
      const keys = keysRef.current;
      let dx = Number(keys.has("ArrowRight") || keys.has("d")) - Number(keys.has("ArrowLeft") || keys.has("a"));
      let dy = Number(keys.has("ArrowDown") || keys.has("s")) - Number(keys.has("ArrowUp") || keys.has("w"));
      const moving = dx !== 0 || dy !== 0;
      setWalking(moving);
      if (moving) {
        if (Math.abs(dx) > Math.abs(dy)) setFacing(dx > 0 ? "right" : "left");
        else setFacing(dy > 0 ? "down" : "up");
        const length = Math.hypot(dx, dy) || 1;
        dx /= length;
        dy /= length;
        setPosition((current) => {
          const speed = 184 * delta;
          let nextX = current.x + dx * speed;
          let nextY = current.y;
          if (collides(nextX, nextY)) nextX = current.x;
          nextY += dy * speed;
          if (collides(nextX, nextY)) nextY = current.y;
          const next = { x: nextX, y: nextY };
          collectNearby(next);
          return next;
        });
      }
      animationFrame = window.requestAnimationFrame(update);
    };
    animationFrame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [collectNearby, dialogue, phase]);

  function startGame() {
    setPhase("playing");
    setPosition({ x: 86, y: 456 });
    setCollected([]);
    collectedRef.current = [];
    setDialogue(null);
    setHint("Encontre os três fragmentos e desperte a porta azul.");
    window.requestAnimationFrame(() => gameRef.current?.focus());
  }

  function interact() {
    const guardian = { x: 480, y: 195 };
    const door = { x: 830, y: 270 };
    if (distance(position, guardian) < 92) {
      setDialogue({
        speaker: "Eco, guardiã do arquivo",
        text: "Você ouviu o chamado da Fênix. O que deseja saber?",
        choices: [
          { label: "Onde estou?", answer: "Este é o Arquivo dos Caminhos: um lugar feito das lembranças, projetos e perguntas que atravessaram a escola." },
          { label: "Como abrir a porta?", answer: "Reúna Curiosidade, Coragem e Comunidade. Quando as três luzes estiverem com você, a porta reconhecerá o caminho." },
          { label: "Quem é você?", answer: "Sou apenas um eco do conhecimento compartilhado. Minha função é lembrar que toda descoberta pode ajudar outra pessoa." },
        ],
      });
      return;
    }
    if (distance(position, door) < 112) {
      if (collected.length === fragments.length) {
        setPhase("complete");
        setDialogue(null);
      } else {
        const remaining = fragments.length - collected.length;
        setDialogue({ speaker: "Porta do Arquivo", text: `A luz ainda está incompleta. Faltam ${remaining} ${remaining === 1 ? "fragmento" : "fragmentos"}.` });
      }
      return;
    }
    setDialogue({ speaker: "Corredor", text: "Nenhum eco responde aqui. Aproxime-se da guardiã ou da porta azul." });
  }

  function holdKey(key: string) {
    keysRef.current.add(key);
    gameRef.current?.focus();
  }

  function choose(answer: string) {
    setDialogue({ speaker: "Eco, guardiã do arquivo", text: answer });
  }

  if (!accessReady) return <main className="secret-game-page secret-locked" aria-label="Verificando a passagem" />;

  if (!accessGranted) return (
    <main className="secret-game-page secret-locked">
      <section className="secret-lock-screen">
        <span aria-hidden="true">✦</span>
        <small>ARQUIVO NÃO CATALOGADO</small>
        <h1>A passagem permanece adormecida</h1>
        <p>A chave precisa ser inserida no Portal Duprat antes que este caminho possa ser aberto.</p>
        <Link href="/">Voltar ao portal</Link>
      </section>
    </main>
  );

  return (
    <main className="secret-game-page">
      <header className="secret-topbar">
        <Link href="/">← Voltar ao Portal Duprat</Link>
        <span>ARQUIVO NÃO CATALOGADO · JD-01</span>
      </header>

      <section className="secret-game-intro">
        <span className="secret-kicker">UMA PASSAGEM FOI DESPERTADA</span>
        <h1>O Corredor da <em>Fênix</em></h1>
        <p>Explore um pequeno mistério original do Portal Duprat.</p>
      </section>

      <section className="game-console" aria-label="Minijogo O Corredor da Fênix">
        <div className="game-hud">
          <span><i className="hud-soul" /> VIAJANTE</span>
          <strong>{collected.length}/{fragments.length} FRAGMENTOS</strong>
          <span className="game-objective">{hint}</span>
        </div>

        <div className="pixel-world" ref={gameRef} tabIndex={0} aria-label="Área de jogo. Use as setas ou WASD para se mover e E para interagir.">
          <div className="pixel-wall"><i /><i /><i /><i /><i /></div>
          <div className="floor-seal" aria-hidden="true"><span>JDF</span></div>
          <div className="pixel-bench bench-a" /><div className="pixel-bench bench-b" /><div className="pixel-bench bench-c" /><div className="pixel-bench bench-d" />
          <div className="archive-table" aria-hidden="true"><span>ARQUIVO</span></div>

          <div className="blue-door" style={worldPosition(870, 270)} aria-label="Porta azul do arquivo"><i /><span>{collected.length === fragments.length ? "ABERTA" : "SELADA"}</span></div>
          <div className="pixel-guardian" style={worldPosition(480, 195)} aria-label="Eco, guardiã do arquivo"><i /><span>!</span></div>

          {fragments.map((fragment) => !collected.includes(fragment.id) && (
            <div className="memory-fragment" style={worldPosition(fragment.x, fragment.y)} key={fragment.id} aria-label={`Fragmento da ${fragment.name}`}><i /><span>{fragment.name}</span></div>
          ))}

          <div className={`pixel-player face-${facing} ${walking && phase === "playing" && !dialogue ? "is-walking" : ""}`} style={worldPosition(position.x, position.y)} aria-label="Seu personagem">
            <i className="player-shadow" /><span className="player-hair" /><span className="player-head"><i /><b /></span><span className="player-body"><i /></span><span className="player-legs"><i /><b /></span>
          </div>

          {phase === "intro" && (
            <div className="game-overlay game-start">
              <span className="pixel-phoenix" aria-hidden="true">✦</span>
              <small>O BRASÃO RESPONDEU</small>
              <h2>Um corredor que não aparece nos mapas</h2>
              <p>Recolha três Fragmentos de História, converse com Eco e descubra o que existe atrás da porta azul.</p>
              <button onClick={startGame}>Entrar no corredor</button>
            </div>
          )}

          {phase === "complete" && (
            <div className="game-overlay game-complete">
              <span className="completion-star" aria-hidden="true">✦</span>
              <small>ARQUIVO RESTAURADO</small>
              <h2>Você encontrou o Caminho da Fênix</h2>
              <p>Conhecimento se torna caminho quando é descoberto, cuidado e compartilhado.</p>
              <div><button onClick={startGame}>Jogar novamente</button><Link href="/">Voltar ao portal</Link></div>
            </div>
          )}
        </div>

        {dialogue && phase === "playing" && (
          <div className="game-dialogue" role="dialog" aria-live="polite" aria-label={`Mensagem de ${dialogue.speaker}`}>
            <span className="dialogue-portrait" aria-hidden="true">✦</span>
            <div><small>{dialogue.speaker}</small><p>{dialogue.text}</p>{dialogue.choices && <nav>{dialogue.choices.map((item) => <button key={item.label} onClick={() => choose(item.answer)}>{item.label}</button>)}</nav>}</div>
            <button className="dialogue-close" onClick={() => setDialogue(null)} aria-label="Continuar">×</button>
          </div>
        )}

        <div className="game-help">
          <div><kbd>WASD</kbd><span>ou setas para andar</span></div><div><kbd>E</kbd><span>interagir</span></div><div><kbd>ESC</kbd><span>fechar diálogo</span></div>
        </div>

        <div className="touch-controls" aria-label="Controles de movimento para celular">
          <button onPointerDown={() => holdKey("ArrowUp")} onPointerLeave={() => keysRef.current.delete("ArrowUp")} aria-label="Mover para cima">▲</button>
          <button onPointerDown={() => holdKey("ArrowLeft")} onPointerLeave={() => keysRef.current.delete("ArrowLeft")} aria-label="Mover para esquerda">◀</button>
          <button onPointerDown={() => holdKey("ArrowDown")} onPointerLeave={() => keysRef.current.delete("ArrowDown")} aria-label="Mover para baixo">▼</button>
          <button onPointerDown={() => holdKey("ArrowRight")} onPointerLeave={() => keysRef.current.delete("ArrowRight")} aria-label="Mover para direita">▶</button>
          <button className="touch-action" onClick={interact} aria-label="Interagir">E</button>
        </div>
      </section>

      <p className="secret-disclaimer">Experiência original em pixel art criada para o Portal Duprat. Sem relação oficial com outros jogos.</p>
    </main>
  );
}
