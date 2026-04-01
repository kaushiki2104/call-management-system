import {prisma} from '../../src/config/db.js'
import bcrypt from 'bcryptjs'

// const prisma = new PrismaClient()

async function main() {

  const password = await bcrypt.hash("superadmin123", 10)

  await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@system.com",
      phoneNumber: "9999999999",
      password: password,
      platformRole: "SUPER_ADMIN"
    }
  })

  console.log("Super Admin created")
}

main()
  .catch(e => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })