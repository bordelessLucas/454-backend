-- Add organization scope columns.
ALTER TABLE "users" ADD COLUMN "unidade_id" INTEGER;
ALTER TABLE "clientes" ADD COLUMN "unidade_id" INTEGER;

-- Backfill existing records to preserve current behavior.
UPDATE "clientes"
SET "unidade_id" = "id"
WHERE "unidade_id" IS NULL;

UPDATE "users"
SET "unidade_id" = "cliente_id"
WHERE "unidade_id" IS NULL;

-- New clients must always belong to an organization.
ALTER TABLE "clientes" ALTER COLUMN "unidade_id" SET NOT NULL;

CREATE INDEX "users_unidade_id_idx" ON "users"("unidade_id");
CREATE INDEX "clientes_unidade_id_idx" ON "clientes"("unidade_id");
