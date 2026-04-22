require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('1234', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@empresa.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'SUPER_ADMIN'
    }
  });
  
  console.log('✅ Usuario creado:', user.email);
  await prisma.$disconnect();
}

createAdmin().catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});
