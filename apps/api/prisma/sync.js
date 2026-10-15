const { PrismaClient } = require('@prisma/client')

//const localUrl = 'postgresql://postgres:password@localhost:2010/postgres?schema=public'
const supabaseUrl =
  'postgresql://postgres:gT**DTFJz%269U9y%24@db.tobjvtxlwywzgifsabqj.supabase.co:5432/postgres'

const local = new PrismaClient({ datasources: { db: { url: localUrl } } })
const remote = new PrismaClient({ datasources: { db: { url: supabaseUrl } } })

async function sync() {
  console.log('Connecting to databases...')

  // 1. Sync Users
  const users = await local.user.findMany()
  console.log(`Found ${users.length} users locally`)
  for (const u of users) {
    await remote.user.upsert({
      where: { uid: u.uid },
      update: { name: u.name, image: u.image },
      create: u,
    })
  }

  // 2. Sync Credentials
  const credentials = await local.credentials.findMany()
  console.log(`Found ${credentials.length} credentials locally`)
  for (const c of credentials) {
    await remote.credentials.upsert({
      where: { uid: c.uid },
      update: { email: c.email, passwordHash: c.passwordHash },
      create: c,
    })
  }

  // 3. Sync AuthProviders
  const authProviders = await local.authProvider.findMany()
  console.log(`Found ${authProviders.length} auth providers locally`)
  for (const a of authProviders) {
    await remote.authProvider.upsert({
      where: { uid: a.uid },
      update: { type: a.type },
      create: a,
    })
  }

  // 4. Sync Customers
  const customers = await local.customer.findMany()
  console.log(`Found ${customers.length} customers locally`)
  for (const cust of customers) {
    await remote.customer.upsert({
      where: { uid: cust.uid },
      update: { displayName: cust.displayName },
      create: cust,
    })
  }

  // 5. Sync Bookings
  const bookings = await local.booking.findMany()
  console.log(`Found ${bookings.length} bookings locally`)
  for (const b of bookings) {
    await remote.booking.upsert({
      where: { id: b.id },
      update: {},
      create: b,
    })
  }

  // 6. Sync BookingTimeline
  const timelines = await local.bookingTimeline.findMany()
  console.log(`Found ${timelines.length} booking timeline entries locally`)
  for (const t of timelines) {
    await remote.bookingTimeline.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    })
  }

  // 7. Sync ValetAssignment
  const valets = await local.valetAssignment.findMany()
  console.log(`Found ${valets.length} valet assignments locally`)
  for (const v of valets) {
    await remote.valetAssignment.upsert({
      where: { bookingId: v.bookingId },
      update: {},
      create: v,
    })
  }

  console.log(
    'Successfully synced all user accounts, credentials, and bookings to Supabase!',
  )
}

sync()
  .catch((err) => {
    console.error('Sync failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await local.$disconnect()
    await remote.$disconnect()
  })
