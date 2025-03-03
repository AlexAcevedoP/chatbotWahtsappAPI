import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      //covertir el mensaje a minusculas y quitar espacios
      const incomingMessage = message.text.body.toLowerCase().trim();

      //validar si el mensajes un saludo o no
      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);      
      }else {      
         const response = `Echo: ${message.text.body}`;
         await whatsappService.sendMessage(message.from, response, message.id);
      }
      await whatsappService.markAsRead(message.id);
    }
  }
  //validar posibles saludos del usuario
  isGreeting(message) {
    const greetings = ['hola', 'hi', 'hello', 'hey', 'holi', 'holis', 'holaa', 'holaaa', 'holaaa', 'holaaaa', 'holaaaaa', 'holaaaaaa', 'Buen dia', 'Buenas tardes', "Buenas noches", 'Buenas', 'Buenas tardes'];
    //validar si el mensaje del usuario es un saludo
    return greetings.includes(message);
  }

  getSenderName(senderInfo){
    return senderInfo.profile?.name || senderInfo.wa_id || "";
  }

  //enviar mensaje de bienvenida
  async sendWelcomeMessage(to, messageId, senderInfo){//recibir la infomacion del usuario y el id del mensaje
    const fullName = this.getSenderName(senderInfo);
    const firstName = fullName.split(' ')[0]; // Obtener el primer nombre
    
    const welcomeMessage = `Hola ${firstName}, Te doy la bienvenida a VETPET, Tu tienda de mascotas en línea. ¿En que te puedo ayudar?.`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId); //enviar mensaje de bienvenida
  }
}

export default new MessageHandler();