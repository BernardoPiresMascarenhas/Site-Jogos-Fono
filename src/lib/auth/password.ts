import bcrypt from "bcryptjs";

/** Custo do bcrypt (2^12 iterações). Mesmo valor usado pela ferramenta de administração. */
export const BCRYPT_COST = 12;

// Hash fictício usado quando o e-mail não existe, para que o tempo de resposta
// seja semelhante e não revele quais e-mails estão cadastrados.
const DUMMY_HASH = "$2b$12$/DWrcgBEhGCcJXe2hx2eo.DanvzMvabP6mLWMARA8Edi3creSAcAG";

export async function verifyPassword(password: string, hash: string | undefined): Promise<boolean> {
  try {
    const ok = await bcrypt.compare(password, hash ?? DUMMY_HASH);
    return Boolean(hash) && ok;
  } catch {
    return false;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}
