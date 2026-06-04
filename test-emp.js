const {PrismaClient} = require('@prisma/client')
const p = new PrismaClient()
p.empleado.findFirst().then(e => {
  console.log('Empleado:', e)
  process.exit(0)
})
