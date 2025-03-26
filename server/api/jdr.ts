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
  const method = getMethod(event)

  if (method === 'GET') {
    const data = await readFile(filePath, 'utf-8')
    return JSON.parse(data)
  }

  if (method === 'DELETE') {
    const rawId = getQuery(event).id
    const id = parseInt(String(rawId))
  
    if (isNaN(id)) {
      throw createError({ statusCode: 400, statusMessage: 'ID invalide' })
    }
  
    const fileData = await readFile(filePath, 'utf-8')
    let jdrList = JSON.parse(fileData)
  
    // Trouver le JDR à supprimer
    const jdrToDelete = jdrList.find((jdr: any) => jdr.id === id)
  
    if (!jdrToDelete) {
      throw createError({ statusCode: 404, statusMessage: 'JDR introuvable' })
    }
  
    // Supprimer le JDR
    jdrList = jdrList.filter((jdr: any) => jdr.id !== id)
  
    // Supprimer ce JDR dans les produits associés des autres
    jdrList = jdrList.map((jdr: any) => {
      if (jdr.associatedProducts?.includes(jdrToDelete.name)) {
        return {
          ...jdr,
          associatedProducts: jdr.associatedProducts.filter((name: string) => name !== jdrToDelete.name)
        }
      }
      return jdr
    })
  
    await writeFile(filePath, JSON.stringify(jdrList, null, 2), 'utf-8')
  
    return { success: true }
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

    if (body.associatedProducts?.length > 0) {
      for (const productName of body.associatedProducts) {
        const associatedJdr = jdrArray.find((jdr: any) => jdr.name === productName)
        if (associatedJdr) {
          if (!Array.isArray(associatedJdr.associatedProducts)) {
            associatedJdr.associatedProducts = []
          }
          if (!associatedJdr.associatedProducts.includes(body.name)) {
            associatedJdr.associatedProducts.push(body.name)
          }
        }
      }
    }

    const newEntry = {
      id: newId,
      ...body,
      associatedProducts: body.associatedProducts || []
    }

    jdrArray.push(newEntry)
    await writeFile(filePath, JSON.stringify(jdrArray, null, 2), 'utf-8')

    return { message: 'Ajouté avec succès', newEntry }
  }

  return sendError(event, createError({ statusCode: 405, statusMessage: 'Méthode non autorisée' }))
})