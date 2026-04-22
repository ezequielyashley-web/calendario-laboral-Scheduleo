// SCHEDULEO - SEED DE BASE DE DATOS
// 80 empleados distribuidos en Madrid Centro (45) y Vallecas (35)

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  // 1. Limpiar datos existentes
  console.log('🗑️  Limpiando datos existentes...')
  await prisma.logAuditoria.deleteMany()
  await prisma.adelanto.deleteMany()
  await prisma.deuda.deleteMany()
  await prisma.cambioTurno.deleteMany()
  await prisma.fichaje.deleteMany()
  await prisma.vacacion.deleteMany()
  await prisma.empleado.deleteMany()
  await prisma.user.deleteMany()
  await prisma.sede.deleteMany()
  await prisma.grupoTrabajo.deleteMany()
  await prisma.configuracion.deleteMany()
  await prisma.empresa.deleteMany()

  // 2. Crear empresa
  console.log('🏢 Creando empresa...')
  const empresa = await prisma.empresa.create({
    data: {
      nombre: 'Mi Empresa S.L.',
      cif: 'B12345678',
      direccion: 'Calle Principal, 1 - Madrid',
      telefono: '912345678',
      email: 'contacto@empresa.com',
      comunidadAutonoma: 'Madrid'
    }
  })

  // 3. Crear sedes
  console.log('🏪 Creando sedes...')
  const sedeCentro = await prisma.sede.create({
    data: {
      nombre: 'Madrid Centro',
      direccion: 'Gran Vía, 50 - Madrid',
      telefono: '911111111',
      tipo: 'PESCADERIA',
      empresaId: empresa.id
    }
  })

  const sedeVallecas = await prisma.sede.create({
    data: {
      nombre: 'Vallecas',
      direccion: 'Av. de la Albufera, 123 - Madrid',
      telefono: '922222222',
      tipo: 'RESTAURANTE',
      empresaId: empresa.id
    }
  })

  // 4. Crear grupos de trabajo
  console.log('👥 Creando grupos de trabajo...')
  const grupos = await Promise.all([
    // Grupos MXJVS
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 1A (Martes-Sábado)', codigo: 'G1A', color: '#3b82f6', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 1B (Martes-Sábado)', codigo: 'G1B', color: '#60a5fa', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 2A (Miércoles-Domingo)', codigo: 'G2A', color: '#ef4444', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 2B (Miércoles-Domingo)', codigo: 'G2B', color: '#f87171', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 3A (Jueves-Lunes)', codigo: 'G3A', color: '#22c55e', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Grupo 3B (Jueves-Lunes)', codigo: 'G3B', color: '#4ade80', empresaId: empresa.id, coberturaMinima: 5 }
    }),
    // Grupos Lunes
    prisma.grupoTrabajo.create({
      data: { nombre: 'Lunes 1', codigo: 'L1', color: '#8b5cf6', empresaId: empresa.id, coberturaMinima: 3 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Lunes 2', codigo: 'L2', color: '#a78bfa', empresaId: empresa.id, coberturaMinima: 3 }
    }),
    prisma.grupoTrabajo.create({
      data: { nombre: 'Lunes 3', codigo: 'L3', color: '#c4b5fd', empresaId: empresa.id, coberturaMinima: 3 }
    })
  ])

  const [G1A, G1B, G2A, G2B, G3A, G3B, L1, L2, L3] = grupos

  // 5. Crear 80 empleados
  console.log('👷 Creando 80 empleados...')
  
  const nombres = ['Ana', 'Juan', 'María', 'Carlos', 'Laura', 'Pedro', 'Carmen', 'José', 'Isabel', 'Manuel']
  const apellidos = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Ruiz']
  
  const empleados = []
  
  // Distribución: Madrid Centro (45), Vallecas (35)
  // Grupos: G1A(13), G1B(13), G2A(13), G2B(13), G3A(14), G3B(14)
  // Lunes: L1(27), L2(27), L3(26)
  
  const distribucion = [
    { sede: sedeCentro, grupo: G1A, cantidad: 7, lunesGrupos: [L1, L2, L3] },
    { sede: sedeCentro, grupo: G1B, cantidad: 7, lunesGrupos: [L1, L2, L3] },
    { sede: sedeCentro, grupo: G2A, cantidad: 8, lunesGrupos: [L1, L2, L3] },
    { sede: sedeCentro, grupo: G2B, cantidad: 7, lunesGrupos: [L1, L2, L3] },
    { sede: sedeCentro, grupo: G3A, cantidad: 8, lunesGrupos: [L1, L2, L3] },
    { sede: sedeCentro, grupo: G3B, cantidad: 8, lunesGrupos: [L1, L2, L3] },
    
    { sede: sedeVallecas, grupo: G1A, cantidad: 6, lunesGrupos: [L1, L2] },
    { sede: sedeVallecas, grupo: G1B, cantidad: 6, lunesGrupos: [L1, L2] },
    { sede: sedeVallecas, grupo: G2A, cantidad: 5, lunesGrupos: [L1, L2] },
    { sede: sedeVallecas, grupo: G2B, cantidad: 6, lunesGrupos: [L1, L2] },
    { sede: sedeVallecas, grupo: G3A, cantidad: 6, lunesGrupos: [L1, L2] },
    { sede: sedeVallecas, grupo: G3B, cantidad: 6, lunesGrupos: [L1, L2] }
  ]
  
  let empleadoNum = 1
  
  for (const dist of distribucion) {
    for (let i = 0; i < dist.cantidad; i++) {
      const nombre = nombres[Math.floor(Math.random() * nombres.length)]
      const apellido1 = apellidos[Math.floor(Math.random() * apellidos.length)]
      const apellido2 = apellidos[Math.floor(Math.random() * apellidos.length)]
      
      // Asignar grupo de lunes rotativo
      const grupoLunes = dist.lunesGrupos[empleadoNum % dist.lunesGrupos.length]
      
      const empleado = await prisma.empleado.create({
        data: {
          nombre,
          apellidos: `${apellido1} ${apellido2}`,
          dni: `${(10000000 + empleadoNum).toString()}X`,
          email: `empleado${empleadoNum}@empresa.com`,
          telefono: `6${(empleadoNum + 10000000).toString().slice(0, 8)}`,
          fechaNacimiento: new Date(1980 + (empleadoNum % 25), (empleadoNum % 12), (empleadoNum % 28) + 1),
          fechaAlta: new Date(2020, empleadoNum % 12, 1),
          empresaId: empresa.id,
          sedeId: dist.sede.id,
          grupoId: dist.grupo.id,
          grupoLunesId: grupoLunes.id,
          direccion: `Calle ${empleadoNum}, Madrid`,
          numeroSeguridadSocial: `280000000000${empleadoNum.toString().padStart(2, '0')}`
        }
      })
      
      empleados.push(empleado)
      empleadoNum++
    }
  }
  
  console.log(`✅ ${empleados.length} empleados creados`)

  // 6. Crear usuarios (admin y empleados)
  console.log('👤 Creando usuarios...')
  
  const hashedPassword = await bcrypt.hash('Scheduleo2024!', 10)
  
  // Super Admin
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@empresa.com',
      password: hashedPassword,
      nombre: 'Administrador',
      rol: 'SUPER_ADMIN',
      empresaId: empresa.id
    }
  })
  
  // Empleado de prueba
  await prisma.user.create({
    data: {
      email: empleados[0].email!,
      password: hashedPassword,
      nombre: empleados[0].nombre,
      rol: 'EMPLEADO',
      empresaId: empresa.id,
      empleadoId: empleados[0].id
    }
  })
  
  console.log('✅ Usuarios creados')

  // 7. Crear configuración
  console.log('⚙️  Creando configuración...')
  await prisma.configuracion.create({
    data: {
      empresaId: empresa.id,
      horaEntrada: '08:00',
      horaSalida: '17:00',
      diasVacacionesAnuales: 30,
      emailNotificaciones: true,
      pushNotificaciones: true
    }
  })

  // 8. Crear algunos datos de prueba
  console.log('📊 Creando datos de prueba...')
  
  // Vacaciones de ejemplo
  await prisma.vacacion.createMany({
    data: [
      {
        empleadoId: empleados[0].id,
        empresaId: empresa.id,
        fechaInicio: new Date(2026, 7, 1), // Agosto
        fechaFin: new Date(2026, 7, 15),
        diasSolicitados: 14,
        tipo: 'VACACION',
        estado: 'APROBADA',
        aprobadoPor: adminUser.id,
        fechaAprobacion: new Date()
      },
      {
        empleadoId: empleados[1].id,
        empresaId: empresa.id,
        fechaInicio: new Date(2026, 6, 15), // Julio
        fechaFin: new Date(2026, 6, 30),
        diasSolicitados: 15,
        tipo: 'VACACION',
        estado: 'PENDIENTE'
      }
    ]
  })
  
  console.log('✅ Datos de prueba creados')

  console.log('\n🎉 SEED COMPLETADO EXITOSAMENTE\n')
  console.log('📋 RESUMEN:')
  console.log(`   • Empresa: ${empresa.nombre}`)
  console.log(`   • Sedes: 2 (Madrid Centro, Vallecas)`)
  console.log(`   • Empleados: ${empleados.length}`)
  console.log(`   • Grupos: 9 (G1A, G1B, G2A, G2B, G3A, G3B, L1, L2, L3)`)
  console.log(`   • Usuarios: 2 (admin, empleado)`)
  console.log('\n🔐 CREDENCIALES DE PRUEBA:')
  console.log(`   Admin: admin@empresa.com / Scheduleo2024!`)
  console.log(`   Empleado: ${empleados[0].email} / Scheduleo2024!`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
