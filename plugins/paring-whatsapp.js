const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, proto, prepareWAMessageMedia } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

// Texts adapted from the file you wanted to modify:
let rtx = "✿  *Vincula tu cuenta usando el código.*\n\nSigue las instrucciones:\n\n✎ *Mas opciones » Dispositivos vinculados » Vincular nuevo dispositivo » Escanea el código Qr.*\n\n↺ El codigo es valido por 60 segundos."
let rtx2_body = `> *❀ OPCIÓN-CODIGO ❀*

𓂃 ࣪ ִֶָ☾.  
> 1. 📲 *WhatsApp → Ajustes*  
> 2. ⛓️‍💥 *Dispositivos vinculados*  
> 3. 🔐 *Toca vincular*  
> 4. ✨ Copia este código:

> ˗ˏˋ ꕤ  {CODE}  ꕤ ˎˊ˗

> ⌛ ⋮ *10 segundos de magia*  
> 🍒 ࣪𓂃 *¡Consejito dale rapidito!* ˚₊‧꒰ა ♡ ໒꒱ ‧₊˚`
let rtx2_footer = "ᴄᴏᴘɪᴀ ᴇʟ ᴄᴏᴅɪɢᴏ ᴀǳɪ ᴀʙᴀᴊᴏ 🌺"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const yukiJBOptions = {}

if (global.conns instanceof Array) console.log()
else global.conns = []

function isSubBotConnected(jid) {
  return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0])
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!globalThis.db?.data?.settings?.[conn.user.jid]?.jadibotmd) return m.reply(`👑 El Comando *${command}* está desactivado temporalmente.`)
  let time = global.db.data.users[m.sender].Subs + 120000
  if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `👑 Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
  let socklimit = global.conns.filter(sock => sock?.user).length
  if (socklimit >= 50) {
    return m.reply(`👑 No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }
  let mentionedJid = await m.mentionedJid
  let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathYukiJadiBot = path.join(`./${jadi}/`, id)
  if (!fs.existsSync(pathYukiJadiBot)){
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })
  }
  yukiJBOptions.pathYukiJadiBot = pathYukiJadiBot
  yukiJBOptions.m = m
  yukiJBOptions.conn = conn
  yukiJBOptions.args = args
  yukiJBOptions.usedPrefix = usedPrefix
  yukiJBOptions.command = command
  yukiJBOptions.fromCommand = true
  yukiJadiBot(yukiJBOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}
handler.help = ['qrr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function yukiJadiBot(options) {
  let { pathYukiJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }
  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  let txtCode, codeBot, txtQR
  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }
  const pathCreds = path.join(pathYukiJadiBot, "creds.json")
  if (!fs.existsSync(pathYukiJadiBot)){
    fs.mkdirSync(pathYukiJadiBot, { recursive: true })}
  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    conn.reply(m.chat, `👑 Use correctamente el comando » ${usedPrefix + command}`, m)
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, `base64`)
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathYukiJadiBot)
    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
      msgRetry,
      msgRetryCache, 
      browser: ['Windows', 'Firefox'],
      version: version,
      generateHighQualityLinkPreview: true
    }
    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    setTimeout(async () => {
      if (!sock.user) {
        try { fs.rmSync(pathYukiJadiBot, { recursive: true, force: true }) } catch {}
        try { sock.ws?.close() } catch {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
        console.log(`[AUTO-LIMPIEZA] Sesión ${path.basename(pathYukiJadiBot)} eliminada credenciales invalidos.`)
      }
    }, 60000)

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
        } else {
          return 
        }
        if (txtQR && txtQR.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
        }
        return
      } 

      if (qr && mcode) {
        // CODE / PAIRING CODE flow with interactive message and copy button
        try {
          // request pairing code for the sub-bot (use the sender name or folder name)
          let raw = await sock.requestPairingCode((m.sender.split`@`[0]))
          // Format code similar to the original file (groups of 4 separated by special char)
          const formatted = raw.match(/.{1,4}/g)?.join(' ⸰ ')
          // Prepare image media (optional) - use same image URL as original script
          const imageUrl = 'https://cdn.russellxz.click/73109d7e.jpg'
          let media = null
          try {
            media = await prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer })
          } catch (e) {
            // if main conn cannot upload, we still continue without media
            media = null
          }

          const header = media ? proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          }) : null

          // Build interactive message with copy button and URL button
          const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
            header,
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text: rtx2_body.replace('{CODE}', formatted)
            }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: rtx2_footer
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𝗖𝗼𝗽𝗶𝗮 𝗘𝗹 𝗖𝗼𝗱𝗶𝗴𝗼 📋",
                    copy_code: raw
                  })
                },
                {
                  name: "cta_url",
                  buttonParamsJson: JSON.stringify({
                    display_text: "𝗖𝗮𝗻𝗮𝗹 𝗢𝗳𝗶𝗰𝗮𝗹 🌷",
                    url: "https://whatsapp.com/channel/0029VbBvZH5LNSa4ovSSbQ2N"
                  })
                }
              ]
            })
          })

          const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: conn.user.jid, quoted: m })
          try {
            await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
          } catch (e) {
            // fallback to text if relay fails
            try {
              await conn.sendMessage(m.chat, { text: `Código: ${raw}` }, { quoted: m })
            } catch (xx) {}
          }

          // delete sent ephemeral messages after 30s (same behavior as original)
          // We already used conn.relayMessage, can't easily delete without keys; attempt to schedule deletion if we have last message
          // If you want deletion, you can store the returned msg and delete accordingly (left out for simplicity)

          console.log(`Código de vinculación enviado: ${raw}`)
        } catch (err) {
          console.error('Error al obtener pairing code:', err)
          try { await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }) } catch {}
          try { await conn.reply(m.chat, `*⚙️ Error: ${err.message}*`, m) } catch {}
        }
      }

      if (txtCode && txtCode.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
      }
      if (codeBot && codeBot.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try {
            sock.ws.close()
          } catch {}
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)                
          if (i < 0) return 
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
      if (connection === 'close') {
        if (reason === 428) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathYukiJadiBot)}) fue cerrada inesperadamente. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 408) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathYukiJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 440) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathYukiJadiBot)}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathYukiJadiBot)}@s.whatsapp.net`, {text : '⚠︎ Hemos detectado una nueva sesión, borre la antigua sesión para continuar.\n\n> ☁︎ Si Hay algún problema vuelva a conectarse.' }, { quoted: m || null }) : ""
          } catch (error) {
            console.error(chalk.bold.yellow(`⚠︎ Error 440 no se pudo enviar mensaje a: +${path.basename(pathYukiJadiBot)}`))
          }
        }
        if (reason == 405 || reason == 401) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${path.basename(pathYukiJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          try {
            if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathYukiJadiBot)}@s.whatsapp.net`, {text : '⚠︎ Sesión pendiente.\n\n> ☁︎ Vuelva a intentar nuevamente volver a ser *SUB-BOT*.' }, { quoted: m || null }) : ""
          } catch (error) {
            console.error(chalk.bold.yellow(`⚠︎ Error 405 no se pudo enviar mensaje a: +${path.basename(pathYukiJadiBot)}`))
          }
          fs.rmdirSync(pathYukiJadiBot, { recursive: true })
        }
        if (reason === 500) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión (+${path.basename(pathYukiJadiBot)}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathYukiJadiBot)}@s.whatsapp.net`, {text : '⚠︎ Conexión perdida.\n\n> ☁︎ Intenté conectarse manualmente para volver a ser *SUB-BOT*' }, { quoted: m || null }) : ""
          return creloadHandler(true).catch(console.error)
        }
        if (reason === 515) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión (+${path.basename(pathYukiJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          await creloadHandler(true).catch(console.error)
        }
        if (reason === 403) {
          console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathYukiJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
          fs.rmdirSync(pathYukiJadiBot, { recursive: true })
        }
      }

      if (global.db.data == null) loadDatabase()
      if (connection == `open`) {
        if (!global.db.data?.users) loadDatabase()
        await joinChannels(conn)
        let userName, userJid 
        userName = sock.authState.creds.me.name || 'Anónimo'
        userJid = sock.authState.creds.me.jid || `${path.basename(pathYukiJadiBot)}@s.whatsapp.net`
        console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(pathYukiJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
        sock.isInit = true
        global.conns.push(sock)
        m?.chat ? await conn.sendMessage(m.chat, { text: isSubBotConnected(m.sender) ? `👑 Has registrado un nuevo Sub-Bot! [@${m.sender.split('@')[0]}]\n> Puedes ver como personalizar tu Sub-Bot usando el comando *#set*` : `👑 Has registrado un nuevo Sub-Bot! [@${m.sender.split('@')[0]}]\n> Puedes ver como personalizar tu Sub-Bot usando el comando *#set*`, mentions: [m.sender] }, { quoted: m }) : ''
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch (e) {}
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i < 0) return
        delete global.conns[i]
        global.conns.splice(i, 1)
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('⚠︎ Nuevo error: ', e)
      }
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }
      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }
      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      isInit = false
      return true
    }
    creloadHandler(false)
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
  seconds = Math.floor((duration / 1000) % 60),
  minutes = Math.floor((duration / (1000 * 60)) % 60),
  hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(sock) {
  for (const value of Object.values(global.ch)) {
    if (typeof value === 'string' && value.endsWith('@newsletter')) {
      await sock.newsletterFollow(value).catch(() => {})
    }
  }
}