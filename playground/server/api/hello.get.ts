export default defineEventHandler(async () => {
  const response = await prisma.user.findFirst()

  if (!response)
    return 'No hay usuarios'

  return response
})
