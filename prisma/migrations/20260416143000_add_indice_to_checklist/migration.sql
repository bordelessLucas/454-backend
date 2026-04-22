ALTER TABLE "checklist"
ADD COLUMN "indice" INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) - 1 AS novo_indice
  FROM "checklist"
)
UPDATE "checklist" c
SET "indice" = o.novo_indice
FROM ordered o
WHERE c.id = o.id;
