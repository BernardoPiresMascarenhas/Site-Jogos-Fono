"use client";

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import { CheckCheck, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/button";
import { Media } from "@/components/media";
import { RELATION_LABEL } from "@/content/games/siga-comando";
import type { Concept, Relation, ResolvedActivity, ScenePosition, SigaComandoActivity } from "@/content/types";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/random";
import { GameShell } from "../shared/game-shell";
import { GAME_TYPE_META } from "../meta";
import type { GameProps } from "../shared/types";
import { ActionBar, ListenButton, PromptCard, PromptText, SuccessBar } from "../shared/ui";
import { useDragDrop } from "../shared/use-drag-drop";
import { useRoundFeedback } from "../shared/use-round-feedback";
import { commandReducer, createCommandRound, initialCommandState, positionKey, samePosition, zonesOf, type CheckResult } from "./engine";

const RESULT_TEXT: Record<Exclude<CheckResult, "ok">, string> = {
  incomplete: "Ainda não. Ouça o comando de novo.",
  extra: "Quase! Só mexa no que o comando pede.",
  order: "Os lugares estão certos, mas a ordem não. Recomece a cena.",
};

/** Figura do marco em relação ao tamanho de um objeto. */
const IMAGE_RATIO = 1.8;

/**
 * Procura o maior tamanho de objeto (e o número de colunas de marcos) que faz
 * a cena caber inteira, sem rolagem.
 */
interface SceneLayout {
  unit: number;
  cols: number;
  /** Tapete na lateral (telas baixas, como celular deitado). */
  floorSide: boolean;
  /** Altura mínima quando nada cabe: a área do jogo passa a rolar em vez de cortar. */
  minHeight?: number;
}

function fitScene(count: number, objects: number, width: number, height: number): SceneLayout {
  const gap = 16;
  const measure = (unit: number) => {
    const zone = unit + 10;
    return { blockW: unit * IMAGE_RATIO + zone + 6, blockH: zone * 2 + unit * IMAGE_RATIO + 22 + 18 };
  };
  for (let unit = 84; unit >= 30; unit -= 2) {
    const { blockW, blockH } = measure(unit);
    for (let cols = count; cols >= 1; cols--) {
      const rows = Math.ceil(count / cols);
      const sceneW = cols * blockW + (cols - 1) * gap + 24;
      const sceneH = rows * blockH + (rows - 1) * 12 + 12;
      // Tapete embaixo
      if (sceneW <= width && sceneH + unit + 44 <= height) return { unit, cols, floorSide: false };
      // Tapete na lateral (2 colunas de objetos)
      const floorW = unit * 2 + 40;
      const floorH = Math.ceil(objects / 2) * (unit + 12) + 32;
      if (sceneW + floorW <= width && Math.max(sceneH, floorH) <= height) return { unit, cols, floorSide: true };
    }
  }
  const unit = 34;
  const { blockH } = measure(unit);
  const cols = Math.min(count, 3);
  return { unit, cols, floorSide: false, minHeight: Math.ceil(count / cols) * blockH + unit + 70 };
}

function parseKey(key: string): ScenePosition {
  if (key === "chao") return { at: "chao" };
  const [at, relation] = key.split(":");
  return { at, relation: relation as Relation };
}

export function SigaComandoGame({ activity, seed, controls, options }: GameProps<ResolvedActivity<SigaComandoActivity>>) {
  const round = useMemo(() => createCommandRound(activity, controls.difficulty, createRng(seed)), [activity, controls.difficulty, seed]);
  const [state, dispatch] = useReducer(commandReducer, round, initialCommandState);
  const command = round[state.index];
  const dragEnabled = options.interacao === "arrastar" && !state.solved;
  const missNonce = state.result && state.result.kind !== "ok" ? state.result.nonce : 0;
  const { feedback, show, successText } = useRoundFeedback({
    solvedKey: state.solved ? `${state.index}` : null,
    missNonce,
    done: state.done,
    missText: state.result && state.result.kind !== "ok" ? RESULT_TEXT[state.result.kind] : undefined,
  });

  useEffect(() => {
    if (state.notice) show("miss", "Esse lugar já está cheio. Escolha outro.");
  }, [state.notice, show]);

  const { bind, dragging, over, ghostStyle } = useDragDrop<string>({
    enabled: dragEnabled,
    onDrop: (objectId, target) => dispatch({ type: "move", objectId, to: parseKey(target) }),
  });

  // Tamanho dos objetos e número de colunas calculados pelo espaço disponível
  // (retrato, paisagem, tablet e celular): escolhe o maior tamanho que cabe.
  const sceneRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<SceneLayout | null>(null);
  useLayoutEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    const update = () => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      setLayout(fitScene(command.landmarkIds.length, command.objects.length, width, height));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [command.landmarkIds.length, command.objects.length]);
  const unit = layout?.unit ?? 0;

  const objectsAt = (pos: ScenePosition) => command.objects.filter((o) => samePosition(state.positions[o.id], pos)).map((o) => o.id);
  const tapZone = (pos: ScenePosition) => {
    if (state.selected) dispatch({ type: "place", to: pos });
  };
  const selectedConcept = state.selected ? activity.lexicon[state.selected] : null;

  const token = (id: string) => {
    const concept = activity.lexicon[id];
    const selected = state.selected === id;
    return (
      <motion.button
        key={id}
        layoutId={`obj-${state.index}-${id}`}
        type="button"
        {...bind(id)}
        onClick={(e) => {
          e.stopPropagation();
          // Com outro objeto selecionado, tocar num objeto que já está num lugar
          // coloca o selecionado ali também (o objeto cobre quase toda a área).
          const here = state.positions[id];
          if (state.selected && state.selected !== id && here && here.at !== "chao") dispatch({ type: "place", to: here });
          else dispatch({ type: "select", objectId: id });
        }}
        aria-label={`${concept.word}${selected ? ", selecionado" : ""}`}
        aria-pressed={selected}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        animate={{ scale: selected ? 1.12 : 1, opacity: dragging === id ? 0.35 : 1 }}
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-2xl bg-white shadow-soft ring-4 transition-shadow",
          selected ? "z-20 shadow-lift ring-sky-600" : "ring-white hover:ring-rose-200",
          dragEnabled && "touch-none cursor-grab active:cursor-grabbing",
        )}
        style={{ width: unit, height: unit }}
      >
        <Media media={concept.media} size={96} decorative className="h-[78%] w-[78%]" />
      </motion.button>
    );
  };

  const zoneButton = (landmark: Concept, relation: Relation, className: string) => {
    const pos: ScenePosition = { at: landmark.id, relation };
    const key = positionKey(pos);
    const items = objectsAt(pos);
    const prep = landmark.article === "a" || landmark.article === "as" ? "da" : "do";
    const label = `${RELATION_LABEL[relation]} ${prep} ${landmark.word.toLocaleLowerCase("pt-BR")}`;
    return (
      <div
        key={key}
        data-drop={key}
        className={cn(
          "relative flex items-center justify-center gap-1 rounded-2xl border-2 border-dashed transition-colors",
          over === key ? "border-sky-600 bg-sky-100" : state.selected ? "border-sky-300 bg-white/70" : "border-ink/10 bg-white/25",
          className,
        )}
        style={{ minHeight: unit + 10, minWidth: unit + 10 }}
      >
        {/* Botão do lugar (por baixo dos objetos): não aninha botões. */}
        <button
          type="button"
          aria-label={label}
          tabIndex={state.selected ? 0 : -1}
          onClick={() => tapZone(pos)}
          className={cn("absolute inset-0 rounded-2xl", state.selected ? "cursor-pointer hover:bg-sky-100/70" : "cursor-default")}
        />
        {items.map(token)}
      </div>
    );
  };

  return (
    <GameShell
      title={GAME_TYPE_META["siga-comando"].label}
      instruction={dragEnabled ? "Arraste ou toque no objeto e depois no lugar." : "Toque no objeto e depois no lugar certo."}
      accent={activity.accent}
      controls={controls}
      progress={{
        current: state.done ? state.total : state.index + (state.solved ? 1 : 0),
        total: state.total,
        label: `Comando ${Math.min(state.index + 1, state.total)} de ${state.total}`,
      }}
      feedback={feedback}
      completed={state.done}
      completionSummary={`Você seguiu ${state.total} comandos.`}
      raisedToast
    >
      <div className="flex h-full flex-col items-center px-3 pt-1 sm:px-6">
        <div className="w-full max-w-4xl shrink-0">
          <PromptCard tone={state.solved ? "success" : "default"} aside={<ListenButton text={command.text} label="Ouvir o comando" />}>
            <PromptText key={state.index}>{command.text}</PromptText>
          </PromptCard>
        </div>

        <LayoutGroup id={`cena-${state.index}`}>
          <div
            ref={sceneRef}
            className={cn(
              "relative mt-3 flex min-h-0 w-full max-w-5xl flex-1 overflow-hidden rounded-[2rem] bg-gradient-to-b from-white/70 to-peach-100/70 ring-1 ring-sand-200",
              layout?.floorSide ? "flex-row-reverse" : "flex-col",
            )}
            style={{ visibility: layout ? "visible" : "hidden", minHeight: layout?.minHeight }}
          >
            <div
              className="grid min-h-0 flex-1 content-center justify-center gap-x-4 gap-y-3 px-3 pt-3"
              style={{ gridTemplateColumns: `repeat(${layout?.cols ?? 1}, auto)` }}
              role="group"
              aria-label="Cena"
            >
              {command.landmarkIds.map((id) => {
                const landmark = activity.lexicon[id];
                const zones = zonesOf(id);
                const image = Math.round(unit * IMAGE_RATIO);
                return (
                  <div
                    key={id}
                    className="grid items-center justify-items-center gap-1.5"
                    style={{ gridTemplateColumns: `${image}px ${unit + 10}px`, gridTemplateRows: `${unit + 10}px ${image}px ${unit + 10}px auto` }}
                  >
                    <div className="col-start-1 row-start-1">{zones.includes("em-cima") && zoneButton(landmark, "em-cima", "")}</div>
                    <div className="relative col-start-1 row-start-2 flex items-center justify-center" style={{ width: image, height: image }}>
                      <Media media={landmark.media} size={180} decorative className="h-full w-full" />
                      {zones.includes("dentro") && (
                        <div className="absolute inset-x-[10%] bottom-[8%] top-[28%] flex items-center justify-center">
                          {zoneButton(landmark, "dentro", "h-full w-full bg-white/40")}
                        </div>
                      )}
                      <span className="sr-only">{landmark.word}</span>
                    </div>
                    <div className="col-start-2 row-start-2">{zones.includes("ao-lado") && zoneButton(landmark, "ao-lado", "")}</div>
                    <div className="col-start-1 row-start-3">{zones.includes("embaixo") && zoneButton(landmark, "embaixo", "")}</div>
                    <span className="col-start-1 row-start-4 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider text-ink-soft" aria-hidden="true">
                      {landmark.word}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tapete: onde os objetos começam (e para onde podem voltar). */}
            <div
              data-drop="chao"
              className={cn(
                "relative m-3 flex shrink-0 flex-wrap items-center justify-center gap-3 rounded-[1.5rem] border-2 border-dashed px-3 py-2 transition-colors",
                layout?.floorSide && "content-center",
                over === "chao" ? "border-sky-600 bg-sky-100" : "border-peach-300 bg-peach-100/80",
              )}
              style={layout?.floorSide ? { width: unit * 2 + 28 } : { minHeight: unit + 20 }}
            >
              <button
                type="button"
                aria-label="Tapete (fora dos lugares)"
                tabIndex={state.selected ? 0 : -1}
                onClick={() => tapZone({ at: "chao" })}
                className={cn("absolute inset-0 rounded-[1.5rem]", state.selected ? "cursor-pointer" : "cursor-default")}
              />
              {objectsAt({ at: "chao" }).map(token)}
              {objectsAt({ at: "chao" }).length === 0 && <span className="pointer-events-none relative text-sm font-bold text-peach-700/70">Tapete</span>}
            </div>
          </div>
        </LayoutGroup>

        <ActionBar>
          {state.solved ? (
            <SuccessBar
              key={state.index}
              message={successText(state.index)}
              last={state.index + 1 >= state.total}
              onNext={() => dispatch({ type: "next", nextCommand: round[state.index + 1] ?? null })}
            />
          ) : (
            <>
              <button type="button" onClick={() => dispatch({ type: "reset", command })} className={buttonClasses("secondary", "lg")}>
                <RotateCcw className="h-5 w-5" aria-hidden />
                <span className="hidden sm:inline">Recomeçar cena</span>
                <span className="sm:hidden">Recomeçar</span>
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: "check", command })}
                disabled={state.history.length === 0}
                className={buttonClasses("primary", "lg")}
              >
                <CheckCheck className="h-5 w-5" aria-hidden />
                Conferir
              </button>
              <p className="sr-only" aria-live="polite">
                {selectedConcept ? `${selectedConcept.word} selecionado. Agora toque no lugar.` : ""}
              </p>
            </>
          )}
        </ActionBar>
      </div>

      {dragging && ghostStyle && (
        <div style={ghostStyle} className="flex items-center justify-center rounded-2xl bg-white shadow-lift ring-4 ring-sky-600" aria-hidden="true">
          <Media media={activity.lexicon[dragging].media} size={96} decorative className="h-[78%] w-[78%]" />
        </div>
      )}
    </GameShell>
  );
}
