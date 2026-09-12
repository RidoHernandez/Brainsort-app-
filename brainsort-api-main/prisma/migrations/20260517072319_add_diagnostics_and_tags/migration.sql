-- AlterTable
ALTER TABLE "algoritmos" ADD COLUMN     "pseudocodigo" JSONB,
ADD COLUMN     "tags" TEXT[];

-- CreateTable
CREATE TABLE "preguntas_diagnostico" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "opciones" TEXT[],
    "indiceCorrecto" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "preguntas_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_diagnostico" (
    "id" TEXT NOT NULL,
    "puntaje" INTEGER NOT NULL,
    "fechaEvaluacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "resultados_diagnostico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rutas_aprendizaje" (
    "id" TEXT NOT NULL,
    "algoritmosId" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "rutas_aprendizaje_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "resultados_diagnostico_usuarioId_key" ON "resultados_diagnostico"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "rutas_aprendizaje_usuarioId_key" ON "rutas_aprendizaje"("usuarioId");

-- AddForeignKey
ALTER TABLE "resultados_diagnostico" ADD CONSTRAINT "resultados_diagnostico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rutas_aprendizaje" ADD CONSTRAINT "rutas_aprendizaje_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
