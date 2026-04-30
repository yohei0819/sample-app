import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const adminHash = await bcrypt.hash('Admin1234!', 10)
  const userHash = await bcrypt.hash('User1234!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: '管理者',
      passwordHash: adminHash,
      role: 'ADMIN',
      emailVerifiedAt: new Date(),
    },
  })
  console.log('✓ admin:', admin.email)

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'テストユーザー',
      passwordHash: userHash,
      role: 'USER',
      emailVerifiedAt: new Date(),
    },
  })
  console.log('✓ user:', user.email)

  const cat = await prisma.category.upsert({
    where: { slug: 'general' },
    update: {},
    create: { name: '一般', slug: 'general' },
  })

  for (let i = 1; i <= 5; i++) {
    await prisma.product.create({
      data: {
        name: `サンプル商品 ${i}`,
        description: `サンプル商品${i}の説明テキストです。`,
        price: i * 1000,
        stock: 10,
        categoryId: cat.id,
        isPublished: true,
        images: [`https://placehold.jp/400x400.png?text=Product+${i}`],
      },
    })
  }
  console.log('✓ 5 products created')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
