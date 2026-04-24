require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Empresa
  const empresa = await prisma.empresa.upsert({
    where: { id: 'empresa-001' },
    update: {},
    create: {
      id: 'empresa-001',
      nombre: 'Mi Empresa S.L.',
      nif: 'B12345678',
    },
  })
  console.log('✅ Empresa:', empresa.nombre)

  // 2. Usuario Admin
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@empresa.com',
      credencial: '1234',
      empresaId: empresa.id,
      rol: 'SUPER_ADMIN',
      requiereCambioCredencial: false,
    },
  })
  console.log('✅ Usuario Admin:', admin.email)

  // 3. Grupos de Turno
  const gruposData = [
    { id: 'g1a', nombre: 'G1A', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
    { id: 'g1b', nombre: 'G1B', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
    { id: 'g2a', nombre: 'G2A', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
    { id: 'g2b', nombre: 'G2B', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
    { id: 'g3a', nombre: 'G3A', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
    { id: 'g3b', nombre: 'G3B', tipo: 'ENTRE_SEMANA', diasTrabajo: 'MXJVS' },
  ]

  for (const g of gruposData) {
    await prisma.grupoTrabajo.upsert({
      where: { id: g.id },
      update: {},
      create: {
        id: g.id,
        nombre: g.nombre,
        empresaId: empresa.id,
        tipo: g.tipo,
        diasTrabajo: g.diasTrabajo,
      },
    })
  }
  console.log('✅ Grupos creados:', gruposData.length)

  console.log('🎉 Seed completado - Admin creado: admin@empresa.com / 1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
