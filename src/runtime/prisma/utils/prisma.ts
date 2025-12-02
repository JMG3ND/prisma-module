import { PrismaClient, Prisma } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function getInstance(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient()
  }
  return globalThis.__prisma
}

// Función para desconectar explícitamente
export async function disconnectPrisma(): Promise<void> {
  if (globalThis.__prisma) {
    await globalThis.__prisma.$disconnect()
    globalThis.__prisma = undefined
  }
}

// Manejo de cierre del proceso
process.on('beforeExit', async () => {
  await disconnectPrisma()
})

export const prisma = getInstance()
export { Prisma }

