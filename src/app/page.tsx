import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Blob, Sparkle, Squiggle } from "@/components/decor";
import { Logo } from "@/components/logo";
import { Media } from "@/components/media";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/config/site";
import { getConcept } from "@/content/concepts";
import { ACTIVITIES } from "@/content";
import { CONCEPTS } from "@/content/concepts";
import type { Concept } from "@/content/types";
import { GAME_TYPE_ICON } from "@/games/icons";
import { GAME_TYPE_META } from "@/games/meta";

const c = (id: string) => getConcept(id) as Concept;

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-5">
        <Link href="/" aria-label={`${siteConfig.name} — início`} className="rounded-xl">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href={siteConfig.owner.website}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("ghost", "sm", "hidden sm:inline-flex")}
          >
            Site da Ana Luiza
          </a>
          <Link href="/entrar" className={buttonClasses("secondary", "sm")}>
            Entrar
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Hero />
        <GameTypes />
        <Note />
      </main>

      <SiteFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative">
      <Blob className="-top-40 -right-40 h-[34rem] w-[34rem] opacity-80" color="#f5e9ee" />
      <Blob className="top-72 -left-52 h-[26rem] w-[26rem] opacity-70" color="#e8efe8" variant={1} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-6 md:pt-10 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pb-24">
        <div className="max-w-xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-bold text-rose-700 ring-1 ring-rose-200">
            <Sparkle className="h-4 w-4" color="#b58a9d" />
            Por {siteConfig.owner.name} · {siteConfig.owner.role}
          </p>
          <h1 className="font-display-soft text-[2.75rem] font-semibold leading-[1.02] tracking-tight text-ink sm:text-6xl lg:text-[4.25rem]">
            Brincar, falar e{" "}
            <span className="relative inline-block text-rose-700">
              aprender
              <Squiggle className="absolute -bottom-3 left-0 h-4 w-full" color="#a8c4b5" />
            </span>{" "}
            juntos.
          </h1>
          <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-soft sm:text-xl">
            Jogos interativos e acolhedores para usar com as crianças durante as sessões de fonoaudiologia — no tablet, no
            notebook ou no celular.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/entrar" className={buttonClasses("primary", "lg")}>
              Acessar plataforma
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <a
              href={siteConfig.owner.website}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("ghost", "lg")}
            >
              Conhecer a Ana Luiza
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <dl className="mt-10 flex gap-8 text-sm text-ink-soft">
            <Stat value={String(ACTIVITIES.length)} label="atividades" />
            <Stat value={`${CONCEPTS.length}`} label="palavras e imagens" />
            <Stat value="3" label="tipos de jogo" />
          </dl>
        </div>
        <HeroArt />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="block font-display-soft text-3xl font-semibold text-ink">{value}</span>
        {label}
      </dd>
    </div>
  );
}

function HeroArt() {
  const tiles: { concept: Concept; className: string; r: string; delay: string }[] = [
    { concept: c("cachorro"), className: "left-[4%] top-[6%] h-24 w-24 sm:h-28 sm:w-28 bg-butter-100", r: "-8deg", delay: "0s" },
    { concept: c("maca"), className: "right-[6%] top-[0%] h-20 w-20 sm:h-24 sm:w-24 bg-peach-100", r: "10deg", delay: "1.2s" },
    { concept: c("escova-de-dentes"), className: "right-[0%] bottom-[18%] h-20 w-20 sm:h-24 sm:w-24 bg-sky-100", r: "-6deg", delay: "2.1s" },
    { concept: c("bola"), className: "left-[0%] bottom-[8%] h-20 w-20 sm:h-24 sm:w-24 bg-sage-100", r: "7deg", delay: "0.6s" },
  ];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[30rem]" aria-hidden="true">
      <div className="absolute inset-[13%] rotate-[-3deg] rounded-[2.75rem] bg-white p-6 shadow-lift ring-1 ring-sand-200 sm:p-8">
        <p className="text-center font-display-soft text-xl font-semibold text-ink sm:text-2xl">Onde está o gato?</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
          {(["sapato", "gato", "carro", "banana"] as const).map((id) => (
            <div
              key={id}
              className={
                id === "gato"
                  ? "relative flex aspect-square items-center justify-center rounded-3xl bg-sage-100 ring-4 ring-sage-500"
                  : "flex aspect-square items-center justify-center rounded-3xl bg-sand-100"
              }
            >
              <Media media={c(id).media} size={72} decorative className="h-3/5 w-3/5" priority />
              {id === "gato" && (
                <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full bg-sage-600 text-white shadow-soft">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      {tiles.map((t) => (
        <div
          key={t.concept.id}
          className={`animate-float-slow absolute flex items-center justify-center rounded-[1.75rem] shadow-soft ring-4 ring-white ${t.className}`}
          style={{ "--r": t.r, animationDelay: t.delay } as React.CSSProperties}
        >
          <Media media={t.concept.media} size={64} decorative className="h-3/5 w-3/5" />
        </div>
      ))}
      <Sparkle className="absolute left-[40%] top-[2%] h-7 w-7" color="#a8c4b5" />
      <Sparkle className="absolute bottom-[4%] right-[30%] h-5 w-5" color="#c39eb0" />
    </div>
  );
}

function GameTypes() {
  const items = [
    {
      type: "ligar" as const,
      bg: "bg-sage-100",
      text: "Toque na palavra e depois na imagem que combina com ela. As ligações ficam desenhadas na tela.",
      art: <LigarArt />,
    },
    {
      type: "memoria" as const,
      bg: "bg-rose-100",
      text: "Cartas que giram de verdade, em dois modos: imagem com imagem ou palavra com imagem.",
      art: <MemoriaArt />,
    },
    {
      type: "onde-esta" as const,
      bg: "bg-butter-100",
      text: "Uma pergunta, algumas imagens. Com botão para ouvir a pergunta em voz alta.",
      art: <OndeArt />,
    },
  ];
  return (
    <section className="relative bg-white/60 py-16 sm:py-24" aria-labelledby="tipos-de-jogo">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <h2 id="tipos-de-jogo" className="font-display-soft text-3xl font-semibold tracking-tight sm:text-4xl">
            Três jeitos de brincar
          </h2>
          <p className="mt-3 text-lg text-ink-soft">
            Cada jogo tem atividades prontas em categorias como animais, alimentos, corpo, higiene e objetos — com
            níveis fácil, médio e difícil.
          </p>
        </div>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item) => {
            const Icon = GAME_TYPE_ICON[item.type];
            return (
              <li key={item.type} className="overflow-hidden rounded-4xl bg-white shadow-soft ring-1 ring-sand-200">
                <div className={`relative flex h-44 items-center justify-center ${item.bg}`}>{item.art}</div>
                <div className="p-6">
                  <h3 className="flex items-center gap-2 text-xl font-extrabold">
                    <Icon className="h-5 w-5 text-rose-600" aria-hidden />
                    {GAME_TYPE_META[item.type].label}
                  </h3>
                  <p className="mt-2 leading-relaxed text-ink-soft">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function LigarArt() {
  return (
    <div className="relative flex w-full max-w-[15rem] items-center justify-between" aria-hidden="true">
      <div className="flex flex-col gap-3">
        <span className="rounded-2xl bg-white px-4 py-2 text-sm font-extrabold tracking-wide shadow-soft">SOL</span>
        <span className="rounded-2xl bg-white px-4 py-2 text-sm font-extrabold tracking-wide shadow-soft">CARRO</span>
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 240 100" preserveAspectRatio="none">
        <path d="M70 26 C 120 26, 120 76, 175 76" fill="none" stroke="#5f8a73" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="1 8" />
      </svg>
      <div className="flex flex-col gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft">
          <Media media={c("carro").media} size={32} decorative />
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-soft">
          <Media media={c("banana").media} size={32} decorative />
        </span>
      </div>
    </div>
  );
}

function MemoriaArt() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="flex h-24 w-[4.5rem] rotate-[-8deg] items-center justify-center rounded-2xl bg-rose-600 shadow-soft">
        <Sparkle className="h-8 w-8" color="#f5e9ee" />
      </span>
      <span className="flex h-24 w-[4.5rem] items-center justify-center rounded-2xl bg-white shadow-soft ring-2 ring-rose-300">
        <Media media={c("gato").media} size={44} decorative />
      </span>
      <span className="flex h-24 w-[4.5rem] rotate-[8deg] items-center justify-center rounded-2xl bg-white text-sm font-extrabold shadow-soft ring-2 ring-rose-300">
        GATO
      </span>
    </div>
  );
}

function OndeArt() {
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="true">
      <span className="rounded-full bg-white px-4 py-1.5 text-sm font-extrabold shadow-soft">ONDE ESTÁ A BOLA?</span>
      <div className="flex gap-2">
        {["uva", "bola", "pato"].map((id) => (
          <span
            key={id}
            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-soft ${id === "bola" ? "ring-4 ring-butter-600" : ""}`}
          >
            <Media media={c(id).media} size={34} decorative />
          </span>
        ))}
      </div>
    </div>
  );
}

function Note() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14">
      <div className="flex flex-col items-start gap-6 rounded-4xl bg-rose-100 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div className="max-w-2xl">
          <h2 className="font-display-soft text-2xl font-semibold sm:text-3xl">Acesso exclusivo para profissionais</h2>
          <p className="mt-2 text-ink-soft">
            Os jogos são um recurso de apoio para uso mediado por fonoaudiólogos. Não substituem avaliação, diagnóstico
            ou tratamento. Nenhum dado das crianças é coletado.
          </p>
        </div>
        <Link href="/entrar" className={buttonClasses("primary", "lg", "shrink-0")}>
          Acessar plataforma
        </Link>
      </div>
    </section>
  );
}
