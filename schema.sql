-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'EMPLEADO',
    "empresaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cif" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empleado" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "numeroEmpleado" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "fechaNacimiento" TIMESTAMP(3),
    "fechaContratacion" TIMESTAMP(3),
    "grupoTrabajoId" TEXT,
    "puestoDeTrabajoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empleado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrupoTrabajo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrupoTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PuestoDeTrabajo" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PuestoDeTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfiguracionCobertura" (
    "id" TEXT NOT NULL,
    "empresaId" TEXT NOT NULL,
    "puestoDeTrabajoId" TEXT NOT NULL,
    "coberturaMinimaL" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaM" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaX" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaJ" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaV" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaS" INTEGER NOT NULL DEFAULT 0,
    "coberturaMinimaD" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracionCobertura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fichaje" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "horaEntrada" TIMESTAMP(3),
    "horaSalida" TIMESTAMP(3),
    "tipo" TEXT NOT NULL DEFAULT 'NORMAL',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fichaje_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vacacion" (
    "id" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "diasTotales" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "aprobadoPor" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vacacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CambioTurno" (
    "id" TEXT NOT NULL,
    "empleadoOrigenId" TEXT NOT NULL,
    "empleadoDestinoId" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "turnoOrigen" TEXT NOT NULL,
    "turnoDestino" TEXT NOT NULL,
    "motivo" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "aprobadoPor" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CambioTurno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAuditoria" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "entidad" TEXT,
    "entidadId" TEXT,
    "detalles" TEXT,
    "ip" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAuditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_empresaId_idx" ON "User"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_cif_key" ON "Empresa"("cif");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_userId_key" ON "Empleado"("userId");

-- CreateIndex
CREATE INDEX "Empleado_grupoTrabajoId_idx" ON "Empleado"("grupoTrabajoId");

-- CreateIndex
CREATE INDEX "Empleado_puestoDeTrabajoId_idx" ON "Empleado"("puestoDeTrabajoId");

-- CreateIndex
CREATE UNIQUE INDEX "Empleado_empresaId_numeroEmpleado_key" ON "Empleado"("empresaId", "numeroEmpleado");

-- CreateIndex
CREATE UNIQUE INDEX "GrupoTrabajo_empresaId_nombre_key" ON "GrupoTrabajo"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "PuestoDeTrabajo_empresaId_idx" ON "PuestoDeTrabajo"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "PuestoDeTrabajo_empresaId_nombre_key" ON "PuestoDeTrabajo"("empresaId", "nombre");

-- CreateIndex
CREATE INDEX "ConfiguracionCobertura_empresaId_idx" ON "ConfiguracionCobertura"("empresaId");

-- CreateIndex
CREATE INDEX "ConfiguracionCobertura_puestoDeTrabajoId_idx" ON "ConfiguracionCobertura"("puestoDeTrabajoId");

-- CreateIndex
CREATE UNIQUE INDEX "ConfiguracionCobertura_empresaId_puestoDeTrabajoId_key" ON "ConfiguracionCobertura"("empresaId", "puestoDeTrabajoId");

-- CreateIndex
CREATE INDEX "Fichaje_empleadoId_idx" ON "Fichaje"("empleadoId");

-- CreateIndex
CREATE INDEX "Fichaje_fecha_idx" ON "Fichaje"("fecha");

-- CreateIndex
CREATE INDEX "Vacacion_empleadoId_idx" ON "Vacacion"("empleadoId");

-- CreateIndex
CREATE INDEX "Vacacion_estado_idx" ON "Vacacion"("estado");

-- CreateIndex
CREATE INDEX "CambioTurno_empleadoOrigenId_idx" ON "CambioTurno"("empleadoOrigenId");

-- CreateIndex
CREATE INDEX "CambioTurno_empleadoDestinoId_idx" ON "CambioTurno"("empleadoDestinoId");

-- CreateIndex
CREATE INDEX "CambioTurno_estado_idx" ON "CambioTurno"("estado");

-- CreateIndex
CREATE INDEX "LogAuditoria_userId_idx" ON "LogAuditoria"("userId");

-- CreateIndex
CREATE INDEX "LogAuditoria_timestamp_idx" ON "LogAuditoria"("timestamp");

-- CreateIndex
CREATE INDEX "LogAuditoria_entidad_idx" ON "LogAuditoria"("entidad");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_grupoTrabajoId_fkey" FOREIGN KEY ("grupoTrabajoId") REFERENCES "GrupoTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empleado" ADD CONSTRAINT "Empleado_puestoDeTrabajoId_fkey" FOREIGN KEY ("puestoDeTrabajoId") REFERENCES "PuestoDeTrabajo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrupoTrabajo" ADD CONSTRAINT "GrupoTrabajo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PuestoDeTrabajo" ADD CONSTRAINT "PuestoDeTrabajo_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionCobertura" ADD CONSTRAINT "ConfiguracionCobertura_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfiguracionCobertura" ADD CONSTRAINT "ConfiguracionCobertura_puestoDeTrabajoId_fkey" FOREIGN KEY ("puestoDeTrabajoId") REFERENCES "PuestoDeTrabajo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fichaje" ADD CONSTRAINT "Fichaje_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacacion" ADD CONSTRAINT "Vacacion_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioTurno" ADD CONSTRAINT "CambioTurno_empleadoOrigenId_fkey" FOREIGN KEY ("empleadoOrigenId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CambioTurno" ADD CONSTRAINT "CambioTurno_empleadoDestinoId_fkey" FOREIGN KEY ("empleadoDestinoId") REFERENCES "Empleado"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

