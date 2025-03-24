import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import { sendError, createError } from 'h3'

export default defineEventHandler((event) => {
  const image = event.context.params?.image

  if (!image || typeof image !== 'string') {
    return sendError(event, createError({ statusCode: 400, statusMessage: 'Image non spécifiée.' }))
  }

  const filePath = join(process.cwd(), 'server/uploads', image)

  if (!existsSync(filePath)) {
    return sendError(event, createError({ statusCode: 404, statusMessage: 'Fichier introuvable.' }))
  }

  return createReadStream(filePath)
})