require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

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
      cif: 'B12345678',
    },
  })
  console.log('✅ Empresa:', empresa.nombre)

  // 2. Usuario Admin (CORREGIDO: user no usuario)
  const hashedPassword = await bcrypt.hash('1234', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      id: 'admin-001',
      email: 'admin@empresa.com',
      password: hashedPassword,
      name: 'Administrador',
      empresaId: empresa.id,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Usuario Admin:', admin.email)

  // 3. Grupos de Turno
  const gruposData = [
    { id: 'g1a', nombre: 'G1A', tipo: 'ENTRE_SEMANA', color: '#7BA8A8' },
    { id: 'g1b', nombre: 'G1B', tipo: 'ENTRE_SEMANA', color: '#6B9999' },
    { id: 'g2a', nombre: 'G2A', tipo: 'ENTRE_SEMANA', color: '#00A896' },
    { id: 'g2b', nombre: 'G2B', tipo: 'ENTRE_SEMANA', color: '#008B8B' },
    { id: 'g3a', nombre: 'G3A', tipo: 'ENTRE_SEMANA', color: '#7BA8A8' },
    { id: 'g3b', nombre: 'G3B', tipo: 'ENTRE_SEMANA', color: '#6B9999' },
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
        color: g.color,
      },
    })
  }
  console.log('✅ Grupos creados:', gruposData.length)

  console.log('🎉 Seed completado - Login: admin@empresa.com / 1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
