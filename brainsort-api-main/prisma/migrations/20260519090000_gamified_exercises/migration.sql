CREATE TYPE "TipoEjercicio" AS ENUM ('PrediccionTexto', 'CompletarPseudocodigo', 'OrdenarBarras');

ALTER TYPE "CategoriaAlgoritmo" ADD VALUE IF NOT EXISTS 'EstructurasArboles';

ALTER TABLE "ejercicios_prediccion"
ADD COLUMN "tipo" "TipoEjercicio" NOT NULL DEFAULT 'PrediccionTexto',
ADD COLUMN "opciones" JSONB,
ADD COLUMN "contenido" JSONB;
