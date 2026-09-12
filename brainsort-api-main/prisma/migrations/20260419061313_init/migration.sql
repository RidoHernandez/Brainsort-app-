-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('Estudiante', 'Profesor', 'Autodidacta');

-- CreateEnum
CREATE TYPE "CategoriaAlgoritmo" AS ENUM ('Ordenamiento', 'Busqueda', 'EstructurasLineales');

-- CreateEnum
CREATE TYPE "DificultadEjercicio" AS ENUM ('Facil', 'Medio', 'Dificil');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'Estudiante',
    "contrasena" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "credencialesAdmin" TEXT NOT NULL,
    "ultimoAcceso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "algoritmos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "complejidadTiempo" TEXT NOT NULL,
    "complejidadEspacio" TEXT NOT NULL,
    "pseudocodigo" TEXT NOT NULL,
    "categoria" "CategoriaAlgoritmo" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "algoritmos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ejercicios_prediccion" (
    "id" TEXT NOT NULL,
    "pregunta" TEXT NOT NULL,
    "respuestaCorrecta" TEXT NOT NULL,
    "dificultad" "DificultadEjercicio" NOT NULL,
    "feedbackPositivo" TEXT NOT NULL,
    "feedbackNegativo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "algoritmoId" TEXT NOT NULL,

    CONSTRAINT "ejercicios_prediccion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_usuario" (
    "id" TEXT NOT NULL,
    "puntosTotales" INTEGER NOT NULL DEFAULT 0,
    "nivelActual" INTEGER NOT NULL DEFAULT 1,
    "rachaDias" INTEGER NOT NULL DEFAULT 0,
    "posicionRanking" INTEGER NOT NULL DEFAULT 0,
    "ultimaActividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "progreso_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insignias" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "imagen" TEXT NOT NULL,
    "criterioDesbloqueo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "insignias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progreso_insignias" (
    "id" TEXT NOT NULL,
    "fechaObtencion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "progresoId" TEXT NOT NULL,
    "insigniaId" TEXT NOT NULL,

    CONSTRAINT "progreso_insignias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sesiones_simulacion" (
    "id" TEXT NOT NULL,
    "pasosCompletados" INTEGER NOT NULL DEFAULT 0,
    "totalPasos" INTEGER NOT NULL,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFin" TIMESTAMP(3),
    "usuarioId" TEXT NOT NULL,
    "algoritmoId" TEXT NOT NULL,

    CONSTRAINT "sesiones_simulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respuestas_ejercicio" (
    "id" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "correcto" BOOLEAN NOT NULL,
    "puntosGanados" INTEGER NOT NULL DEFAULT 0,
    "fechaRespuesta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" TEXT NOT NULL,
    "ejercicioId" TEXT NOT NULL,

    CONSTRAINT "respuestas_ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "administradores_correo_key" ON "administradores"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "algoritmos_nombre_key" ON "algoritmos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_usuario_usuarioId_key" ON "progreso_usuario"("usuarioId");

-- CreateIndex
CREATE INDEX "progreso_usuario_puntosTotales_idx" ON "progreso_usuario"("puntosTotales" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "insignias_nombre_key" ON "insignias"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "progreso_insignias_progresoId_insigniaId_key" ON "progreso_insignias"("progresoId", "insigniaId");

-- AddForeignKey
ALTER TABLE "ejercicios_prediccion" ADD CONSTRAINT "ejercicios_prediccion_algoritmoId_fkey" FOREIGN KEY ("algoritmoId") REFERENCES "algoritmos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_usuario" ADD CONSTRAINT "progreso_usuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_insignias" ADD CONSTRAINT "progreso_insignias_progresoId_fkey" FOREIGN KEY ("progresoId") REFERENCES "progreso_usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progreso_insignias" ADD CONSTRAINT "progreso_insignias_insigniaId_fkey" FOREIGN KEY ("insigniaId") REFERENCES "insignias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_simulacion" ADD CONSTRAINT "sesiones_simulacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sesiones_simulacion" ADD CONSTRAINT "sesiones_simulacion_algoritmoId_fkey" FOREIGN KEY ("algoritmoId") REFERENCES "algoritmos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_ejercicio" ADD CONSTRAINT "respuestas_ejercicio_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respuestas_ejercicio" ADD CONSTRAINT "respuestas_ejercicio_ejercicioId_fkey" FOREIGN KEY ("ejercicioId") REFERENCES "ejercicios_prediccion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
