require('dotenv').config({ path: '.env.local' })

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // 1. Empresa
  const empresa = await prisma.empresa.upsert({
    where: { id: 'empresa-1' },
    update: {},
    create: {
      id: 'empresa-1',
      nombre: 'Mi Empresa S.L.',
      cif: 'B12345678',
    },
  })
  console.log('✅ Empresa:', empresa.nombre)

  // 2. Grupos
  const grupos = [
    { nombre: 'G1A', color: '#3b82f6' },
    { nombre: 'G1B', color: '#60a5fa' },
    { nombre: 'G2A', color: '#ef4444' },
    { nombre: 'G2B', color: '#f87171' },
    { nombre: 'G3A', color: '#10b981' },
    { nombre: 'G3B', color: '#34d399' },
  ]
  
  for (const g of grupos) {
    await prisma.grupoTrabajo.upsert({
      where: { id: `grupo-${g.nombre.toLowerCase()}` },
      update: {},
      create: {
        id: `grupo-${g.nombre.toLowerCase()}`,
        nombre: g.nombre,
        tipo: 'SEMANAL',
        color: g.color,
        empresaId: empresa.id,
      },
    })
  }
  console.log('✅ Grupos creados:', grupos.length)
  
  console.log('🎉 Seed básico completado')
  console.log('📝 Nota: Empleados se crearán desde la UI')
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
