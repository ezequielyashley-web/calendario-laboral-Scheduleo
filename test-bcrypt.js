const bcrypt = require('bcryptjs')
const hash = '$2b$10$34tTgl5VFQlKFFXayV/8X.A8KYWgyQQAq3dPNWy6A9jzh5cm9ZVTu'
const password = '1234'
bcrypt.compare(password, hash).then(r => {
  console.log('Match:', r)
  process.exit(0)
})
