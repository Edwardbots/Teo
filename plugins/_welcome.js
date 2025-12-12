import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = m => m
handler.before = async function (m, { conn }) {
    // 1. Verificar si el mensaje es un evento Stub y de grupo
    if (!m.messageStubType || !m.isGroup) return true;

    let chat = global.db.data.chats[m.chat];

    // 2. Si la función de bienvenida está desactivada, salir
    if (!chat.welcome) return true;

    // Obtener el ID del usuario afectado por el evento (el primero en el array)
    const userId = m.messageStubParameters[0];
    if (!userId) return true; // Si no hay usuario afectado, salir

    let groupMetadata;
    try {
        // 3. Obtener metadatos del grupo
        groupMetadata = await conn.groupMetadata(m.chat);
    } catch (e) {
        return true;
    }

    const groupName = groupMetadata.subject;
    // En el stub event, la lista de participantes es la que está por actualizarse.
    const membersCount = groupMetadata.participants.length; 
    
    // Preparar variables comunes
    const mentionId = userId.split('@')[0];
    const mentionsList = [userId]; 

    // URLs de las imágenes
    const welcomeImageUrl = 'https://cdn.russellxz.click/6ae2181d.jpg';
    const goodbyeImageUrl = 'https://cdn.russellxz.click/9f98f272.jpg';
    
    // Lógica de Bienvenida (ADD)
    if (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_ADD) {
        // En el stub ADD, el conteo real es el actual + 1.
        const finalCount = membersCount + 1; 
        
        let welcomeText = `✨ *¡Bienvenido/a a ${groupName}!* ✨\n\n`;
        welcomeText += `👋 Hola, @${mentionId}!\n`;
        welcomeText += `🎉 Ahora somos *${finalCount}* miembros.\n`; 
        welcomeText += `📜 Por favor, lee la descripción y respeta las normas.\n\n`;
        welcomeText += `*¡Disfruta tu estancia!* 🥳`;

        await conn.sendMessage(
            m.chat,
            {
                image: { url: welcomeImageUrl },
                caption: welcomeText,
                mentions: mentionsList
            }
        );
    }

    // Lógica de Despedida (REMOVE/LEAVE)
    if (m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType == WAMessageStubType.GROUP_PARTICIPANT_LEAVE) {
        // En el stub REMOVE/LEAVE, el conteo real es el actual - 1.
        const finalCount = membersCount - 1; 

        let goodbyeText = `👋 *¡Adiós, @${mentionId}!* 👋\n\n`;
        goodbyeText += `📉 El grupo *${groupName}* pierde a un miembro.\n`;
        goodbyeText += `🕊️ Ahora somos *${finalCount}* miembros.\n\n`; 
        goodbyeText += `¡Esperamos verte pronto!`;

        await conn.sendMessage(
            m.chat,
            {
                image: { url: goodbyeImageUrl },
                caption: goodbyeText,
                mentions: mentionsList
            }
        );
    }
    
    return true; // Continuar con el procesamiento normal si no es un evento manejado
};

// Indicamos que es un handler de grupo
handler.group = true; 

export default handler;
