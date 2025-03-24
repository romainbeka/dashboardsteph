import { readMultipartFormData, createError, sendError } from 'h3'
import { readFile, writeFile } from 'fs/promises'
import { mkdirSync, existsSync, writeFileSync } from 'fs'
import { join } from 'path'

const filePath = join(process.cwd(), 'server', 'data', 'jdr.json')
const uploadDir = join(process.cwd(), 'public', 'uploads')

// Créer le dossier s’il n’existe pas
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true })
}

export default defineEventHandler(async (event) => {
  const method = event.method

  if (method === 'GET') {
    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data)
  }

  if (method === 'POST') {
    const form = await readMultipartFormData(event)
    const body: any = {}

    if (!form) {
      return sendError(event, createError({ statusCode: 400, statusMessage: 'Aucune donnée reçue.' }))
    }

    for (const item of form) {
      if (item.name === 'image' && item.filename && item.data) {
        const fileName = `${Date.now()}_${item.filename}`
        const imagePath = join(uploadDir, fileName)

        writeFileSync(imagePath, item.data)

        body.avatar = { src: `/uploads/${fileName}` }
      } else if (item.name && item.data) {
        try {
          body[item.name] = JSON.parse(item.data.toString('utf-8'))
        } catch {
          body[item.name] = item.data.toString('utf-8')
        }
      }
    }

    // Lire les données existantes
    const jsonData = await readFile(filePath, 'utf-8')
    const jdrArray = JSON.parse(jsonData)

    // 🔢 Gérer l’ID auto-incrémenté
    const lastId = jdrArray.length > 0 ? Math.max(...jdrArray.map((item: any) => item.id || 0)) : 0
    const newId = lastId + 1

    const newEntry = {
      id: newId,
      ...body
    }

    jdrArray.push(newEntry)
    await writeFile(filePath, JSON.stringify(jdrArray, null, 2), 'utf-8')

    return { message: 'Ajouté avec succès', newEntry }
  }

  return sendError(event, createError({ statusCode: 405, statusMessage: 'Méthode non autorisée' }))
})