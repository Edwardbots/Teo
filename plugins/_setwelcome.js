// _setwelcome.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta a la carpeta de assets (donde guardarás las imágenes)
const assetsPath = path.join(__dirname, '../assets')

// Función para asegurarse de que la carpeta de assets exista
const ensureAssetsDir = () => {
    if (!fs.existsSync(assetsPath)) {
        fs.mkdirSync(assetsPath, { recursive: true })
    }
}

// Función para obtener la ruta de la imagen de bienvenida
const getWelcomeImagePath = (chatId) => {
    ensureAssetsDir()
    return path.join(assetsPath, `welcome_${chatId}.jpg`)
}

let handler = async (m, { conn, usedPrefix, command, isAdmin, isROwner }) => {
    if (!m.isGroup) {
        await m.react('❌')
        return m.reply('> ⓘ Este comando solo funciona en grupos.')
    }

    // Solo admins o el creador pueden usar este comando
    if (!isAdmin && !isROwner) {
        await m.react('🚫')
        return m.reply('> ⓘ Solo los administradores pueden usar este comando.')
    }

    let chat = global.db.data.chats[m.chat]
    let args = m.text.trim().split(' ').slice(1)
    let action = args[0]?.toLowerCase()

    if (!action) {
        let status = chat.welcome ? '🟢 ACTIVADO' : '🔴 DESACTIVADO'
        await m.react('ℹ️')
        return m.reply(`╭─「 🎉 *BIENVENIDA PERSONALIZADA* 🎉 」
│ 
│ 📊 Estado actual: ${status}
│ 
│ 💡 *Uso del comando:*
│ ├ ${usedPrefix}${command} on - Activar bienvenida
│ ├ ${usedPrefix}${command} off - Desactivar bienvenida
│ ├ ${usedPrefix}${command} mensaje <texto> - Personalizar mensaje
│ └ ${usedPrefix}${command} imagen (responde a una imagen) - Personalizar imagen
│ 
│ 📝 *Variables disponibles para el mensaje:*
│ ├ @user - Mención al usuario
│ ├ @username - Nombre del usuario
│ ├ @groupname - Nombre del grupo
│ ├ @groupdesc - Descripción del grupo
│ ├ @membercount - Número de miembros
│ ├ @membernum - Número del miembro (ej: 12th)
│ └ @groupid - ID del grupo
│ 
│ 📝 *Mensaje actual:*
│ ${chat.welcomeMessage || 'No hay mensaje personalizado'}
╰─◉`.trim())
    }

    if (action === 'on') {
        if (chat.welcome) {
            await m.react('ℹ️')
            return m.reply('> ⓘ La bienvenida personalizada ya está activada en este grupo.')
        }
        chat.welcome = true
        await m.react('✅')
        m.reply(`╭─「 🎉 *BIENVENIDA ACTIVADA* 🎉 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ La bienvenida personalizada ahora está
│ └ activada en este grupo.
│ 
│ 🔓 *Bienvenida activada*
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())
    } else if (action === 'off') {
        if (!chat.welcome) {
            await m.react('ℹ️')
            return m.reply('> ⓘ La bienvenida personalizada ya está desactivada en este grupo.')
        }
        chat.welcome = false
        await m.react('✅')
        m.reply(`╭─「 🎉 *BIENVENIDA DESACTIVADA* 🎉 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ La bienvenida personalizada ahora está
│ └ desactivada en este grupo.
│ 
│ 🔒 *Bienvenida desactivada*
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())
    } else if (action === 'mensaje') {
        let message = args.slice(1).join(' ')
        if (!message) {
            await m.react('❌')
            return m.reply('> ⓘ Debes proporcionar un mensaje para la bienvenida.')
        }
        chat.welcomeMessage = message
        await m.react('✅')
        m.reply(`╭─「 🎉 *MENSAJE DE BIENVENIDA* 🎉 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ El mensaje de bienvenida ha sido
│ └ personalizado correctamente.
│ 
│ 📝 *Mensaje actual:*
│ ${message}
│ 
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())
    } else if (action === 'imagen') {
        let quoted = m.quoted ? m.quoted : m
        let mime = (quoted.msg || quoted).mimetype || ''
        if (!mime || !mime.includes('image')) {
            await m.react('❌')
            return m.reply('> ⓘ Responde a una imagen para establecerla como imagen de bienvenida.')
        }
        let media = await quoted.download()
        let imagePath = getWelcomeImagePath(m.chat)
        fs.writeFileSync(imagePath, media)
        await m.react('✅')
        m.reply(`╭─「 🎉 *IMAGEN DE BIENVENIDA* 🎉 」
│ 
│ ✅ *Configuración aplicada:*
│ ├ La imagen de bienvenida ha sido
│ └ establecida correctamente.
│ 
│ 🖼️ *Imagen guardada en:*
│ ${imagePath}
│ 
│ 📍 Grupo: ${m.chat}
╰─◉`.trim())
    } else {
        await m.react('❌')
        return m.reply('> ⓘ Acción no válida. Usa "on", "off", "mensaje" o "imagen".')
    }
}

handler.help = ['setwelcome on', 'setwelcome off', 'setwelcome mensaje <texto>', 'setwelcome imagen']
handler.tags = ['group']
handler.command = /^setwelcome$/i
handler.group = true
handler.admin = true

export default handler
