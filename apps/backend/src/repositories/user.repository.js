import { prisma } from '../db/client.js'

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
}

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } })
}

export function createLocalUser(data) {
  return prisma.user.create({ data })
}

export async function upsertGoogleAccount({ email, name, avatarUrl, providerAccountId }) {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (existing) {
    await prisma.authAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId,
        },
      },
      update: { userId: existing.id },
      create: {
        userId: existing.id,
        provider: 'google',
        providerAccountId,
      },
    })

    return prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        avatarUrl,
        emailVerified: true,
      },
    })
  }

  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      name,
      avatarUrl,
      emailVerified: true,
      authAccounts: {
        create: {
          provider: 'google',
          providerAccountId,
        },
      },
    },
  })
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true,
    },
  })
}
