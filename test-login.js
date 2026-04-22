const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'admin@empresa.com';
  const password = '1234';
  
  console.log('1. Buscando usuario...');
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.log('❌ Usuario NO encontrado');
    return;
  }
  
  console.log('✅ Usuario encontrado:', user.email);
  console.log('Password hash:', user.password.substring(0, 20) + '...');
  
  console.log('\n2. Verificando password...');
  const isValid = await bcrypt.compare(password, user.password);
  
  console.log(isValid ? '✅ Password CORRECTO' : '❌ Password INCORRECTO');
  
  await prisma.$disconnect();
}

testLogin().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
