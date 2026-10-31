"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Feedback } from "./use-feedback";

/** Mensagem flutuante (não desloca o layout) + anúncio para leitores de tela. */
export function FeedbackToast({ feedback }: { feedback: Feedback | null }) {
  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {feedback?.message}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-30 flex justify-center px-4 sm:bottom-6">
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-5 py-3 text-lg font-extrabold shadow-lift",
                feedback.kind === "success" ? "bg-sage-600 text-white" : "bg-white text-peach-700 ring-2 ring-peach-300",
              )}
              aria-hidden="true"
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  feedback.kind === "success" ? "bg-white/25" : "bg-peach-100",
                )}
              >
                {feedback.kind === "success" ? <Check className="h-4 w-4" strokeWidth={3.5} /> : <RotateCcw className="h-4 w-4" strokeWidth={3} />}
              </span>
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
