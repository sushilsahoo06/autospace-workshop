const { PrismaClient } = require('@prisma/client')

const supabaseUrl =
  'postgresql://postgres:gT**DTFJz%269U9y%24@db.tobjvtxlwywzgifsabqj.supabase.co:5432/postgres'

const local = new PrismaClient({ datasources: { db: { url: localUrl } } })
const remote = new PrismaClient({ datasources: { db: { url: supabaseUrl } } })

async function main() {
  const localCred = await local.credentials.findFirst({
    where: { email: 'sahoosushil825@gmail.com' },
  })

  if (!localCred) {
    console.error('Local credentials not found!')
    return
  }

  console.log(
    'Found local password hash length:',
    localCred.passwordHash.length,
  )

  const updated = await remote.credentials.update({
    where: { uid: '9d2c0ba3-2055-4751-924a-a8b85221906e' },
    data: {
      passwordHash: localCred.passwordHash,
    },
  })

  console.log(
    'Remote password hash updated successfully. Length:',
    updated.passwordHash.length,
  )
}

main()
  .catch(console.error)
  .finally(async () => {
    await local.$disconnect()
    await remote.$disconnect()
  })
