"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { loginSchema } from "@/lib/auth/schemas";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { status: "idle" };

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [clientErrors, setClientErrors] = useState<LoginState["fieldErrors"]>();

  const errors = clientErrors ?? state.fieldErrors;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: data.get("email"), password: data.get("password") });
    if (!parsed.success) {
      event.preventDefault();
      const flat = parsed.error.flatten().fieldErrors;
      setClientErrors({ email: flat.email?.[0], password: flat.password?.[0] });
      return;
    }
    setClientErrors(undefined);
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
      <input type="hidden" name="de" value={redirectTo} />

      {state.message && !clientErrors && (
        <div role="alert" className="flex gap-3 rounded-2xl bg-peach-100 px-4 py-3 text-sm font-semibold text-peach-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{state.message}</p>
        </div>
      )}

      <Field label="E-mail" id="email" error={errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.email}
          key={state.email ?? "email"}
          aria-invalid={errors?.email ? true : undefined}
          aria-describedby={errors?.email ? "email-erro" : undefined}
          className={inputClasses(Boolean(errors?.email))}
          placeholder="voce@exemplo.com"
        />
      </Field>

      <Field label="Senha" id="password" error={errors?.password}>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            aria-invalid={errors?.password ? true : undefined}
            aria-describedby={errors?.password ? "password-erro" : undefined}
            className={cn(inputClasses(Boolean(errors?.password)), "pr-14")}
            placeholder="Sua senha"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-xl text-ink-soft hover:bg-sand-100 hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </Field>

      <Button type="submit" size="lg" className="w-full" disabled={pending} aria-busy={pending}>
        {pending ? (
          <>
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden />
            Entrando…
          </>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  );
}

function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-erro`} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-peach-700">
          <AlertCircle className="h-4 w-4" aria-hidden />
          {error}
        </p>
      )}
    </div>
  );
}

function inputClasses(invalid: boolean) {
  return cn(
    "h-14 w-full rounded-2xl bg-white px-4 text-base text-ink shadow-soft ring-1 transition placeholder:text-ink-faint focus:outline-none focus:ring-[3px]",
    invalid ? "ring-peach-600 focus:ring-peach-600/50" : "ring-sand-300 focus:ring-rose-300",
  );
}
