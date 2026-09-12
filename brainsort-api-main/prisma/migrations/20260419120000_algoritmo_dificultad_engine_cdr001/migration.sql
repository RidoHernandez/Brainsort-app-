-- Align Algoritmo model with HU-01 / CDR-001:
-- - add dificultad for library cards
-- - remove pseudocodigo (now owned by engines)
ALTER TABLE "algoritmos"
ADD COLUMN "dificultad" TEXT;

UPDATE "algoritmos"
SET "dificultad" = 'Facil'
WHERE "dificultad" IS NULL;

ALTER TABLE "algoritmos"
ALTER COLUMN "dificultad" SET NOT NULL;

ALTER TABLE "algoritmos"
DROP COLUMN "pseudocodigo";
