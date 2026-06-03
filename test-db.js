const {PrismaClient} = require('@prisma/client')
const p = new PrismaClient()
p.user.findUnique({ where: { email: 'admin@empresa.com' } }).then(u => {
  console.log('Usuario:', u?.email)
  console.log('Password hash:', u?.password?.substring(0, 20))
  process.exit(0)
})
