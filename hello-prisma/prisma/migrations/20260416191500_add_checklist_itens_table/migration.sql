CREATE TABLE "checklist_itens" (
    "id" SERIAL NOT NULL,
    "checklist_id" INTEGER NOT NULL,
    "texto" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_itens_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "checklist_itens_checklist_id_ordem_idx" ON "checklist_itens"("checklist_id", "ordem");

ALTER TABLE "checklist_itens"
ADD CONSTRAINT "checklist_itens_checklist_id_fkey"
FOREIGN KEY ("checklist_id") REFERENCES "checklist"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
