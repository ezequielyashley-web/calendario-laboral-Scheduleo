// Script para generar hash de contraseña
const bcrypt = require('bcryptjs');

const password = 'Scheduleo2024!';
const hash = bcrypt.hashSync(password, 10);

console.log('========================================');
console.log('Hash para: Scheduleo2024!');
console.log('========================================');
console.log(hash);
console.log('========================================');
console.log('\nCopia este hash y úsalo en el SQL de Supabase');
