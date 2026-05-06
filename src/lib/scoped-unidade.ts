import type { AuthUser } from "../middlewares/auth.middleware.js";

/**
 * ADMIN: `null` = sem filtro de unidade (vê tudo).
 * TECNICO: número da unidade do token (obrigatório).
 */
export function resolveScopedUnidadeIdForRequest(
	user: AuthUser | undefined,
):
	| { ok: true; scopedUnidadeId: number | null }
	| { ok: false; reason: "no-user" | "no-unidade" } {
	if (!user) {
		return { ok: false, reason: "no-user" };
	}
	if (user.role === "ADMIN") {
		return { ok: true, scopedUnidadeId: null };
	}
	if (user.unidadeId == null) {
		return { ok: false, reason: "no-unidade" };
	}
	return { ok: true, scopedUnidadeId: user.unidadeId };
}
