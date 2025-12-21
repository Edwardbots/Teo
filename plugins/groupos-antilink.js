let handler = async (m, { conn, args, usedPrefix, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return

  const action = args[0]?.toLowerCase()
  if (!global.antilink) global.antilink = {}

  if (!action) {
    return conn.reply(m.chat, `> ⓘ Uso: *${usedPrefix}antilink on/off*`, m)
  }

  if (action === 'on') {
    global.antilink[m.chat] = true
    await m.react('🟢')
  } else if (action === 'off') {
    delete global.antilink[m.chat]
    await m.react('🔴')
  }
}

handler.before = async (m, { conn }) => {
  if (!m.isGroup || m.isBaileys) return
  if (!global.antilink?.[m.chat]) return

  const text = m.text || m.caption
  if (!text) return

  // 🔒 DETECTA CUALQUIER LINK
  const linkRegex = /((https?:\/\/)|(www\.))\S+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/\S*)?/i
  if (!linkRegex.test(text)) return

  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants

  const isUserAdmin = participants.some(p => p.id === m.sender && p.admin)
  const isBotAdmin = participants.some(p => p.id === conn.user.id && p.admin)

  if (isUserAdmin || !isBotAdmin) return

  try {
    // 🕐 detectado
    await m.react('🕐')

    // 🧹 aviso de limpieza
    await m.react('🧹')

    // ❌ aviso de expulsión
    await m.react('⛔️')

    // 💥 borrar mensaje
    await conn.sendMessage(m.chat, { delete: m.key })

    // 🚪 expulsar usuario
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')

  } catch (e) {
    console.error('[ANTILINK]', e)
  }
}

handler.help = ['antilink on/off']
handler.tags = ['group']
handler.command = ['antilink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler