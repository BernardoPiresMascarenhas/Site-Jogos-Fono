/**
 * Limitador de tentativas de login EM MEMÓRIA.
 *
 * ATENÇÃO: em ambiente serverless (Vercel), cada instância tem a sua própria
 * memória e as instâncias são recriadas com frequência. Esta proteção é apenas
 * uma camada extra de "melhor esforço" — NÃO é um rate limiter distribuído.
 * Para uma proteção confiável, configure uma regra de Rate Limiting no
 * Vercel Firewall (veja o README, seção "Proteção contra tentativas repetidas").
 */
export interface RateLimiterOptions {
  windowMs: number;
  maxAttemptsPerEmailAndIp: number;
  maxAttemptsPerIp: number;
  maxKeys?: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export function createLoginRateLimiter(options: RateLimiterOptions) {
  const buckets = new Map<string, Bucket>();
  const maxKeys = options.maxKeys ?? 10_000;

  function get(key: string, now: number): Bucket | undefined {
    const b = buckets.get(key);
    if (b && b.resetAt <= now) {
      buckets.delete(key);
      return undefined;
    }
    return b;
  }

  function bump(key: string, now: number) {
    const b = get(key, now);
    if (b) b.count++;
    else {
      if (buckets.size >= maxKeys) {
        for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
        if (buckets.size >= maxKeys) buckets.delete(buckets.keys().next().value!);
      }
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    }
  }

  const keysFor = (email: string, ip: string) => ({ pair: `p:${ip}:${email}`, ip: `i:${ip}` });

  return {
    isBlocked(email: string, ip: string, now = Date.now()): boolean {
      const k = keysFor(email, ip);
      return (
        (get(k.pair, now)?.count ?? 0) >= options.maxAttemptsPerEmailAndIp ||
        (get(k.ip, now)?.count ?? 0) >= options.maxAttemptsPerIp
      );
    },
    recordFailure(email: string, ip: string, now = Date.now()) {
      const k = keysFor(email, ip);
      bump(k.pair, now);
      bump(k.ip, now);
    },
    recordSuccess(email: string, ip: string) {
      buckets.delete(keysFor(email, ip).pair);
    },
    size: () => buckets.size,
  };
}

/** IP do cliente. Na Vercel, x-forwarded-for é definido pela própria plataforma. */
export function clientIp(headers: Headers | undefined): string {
  const forwarded = headers?.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers?.get("x-real-ip")?.trim() || "desconhecido";
}
