-- AlterTable
ALTER TABLE "contratos" ADD COLUMN     "condicoes" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "cliente_id" INTEGER;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
