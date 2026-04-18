import { prisma } from '../db/client.js'

export function createRefreshSession(data) {
  return prisma.refreshToken.create({ data })
}

export function findRefreshSession(tokenId, tokenHash) {
  return prisma.refreshToken.findFirst({
    where: {
      tokenId,
      tokenHash,
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  })
}

export function revokeRefreshSession(tokenId, tokenHash) {
  return prisma.refreshToken.updateMany({
    where: {
      tokenId,
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  })
}
