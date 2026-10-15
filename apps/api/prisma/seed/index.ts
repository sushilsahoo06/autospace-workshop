import { PrismaClient } from '@prisma/client'
import { garages } from './data'

let prisma

async function main() {
  prisma = new PrismaClient()

  await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      displayName: 'Autospace Company',
      description: 'Main parking operations company',
    },
  })

  for (const garage of garages) {
    await prisma.garage.create({
      data: garage,
    })
  }
}

main()
  .catch((e) => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
