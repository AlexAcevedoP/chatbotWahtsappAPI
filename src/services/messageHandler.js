import { response } from 'express';
import whatsappService from './whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      //covertir el mensaje a minusculas y quitar espacios
      const incomingMessage = message.text.body.toLowerCase().trim();

      //validar si el mensajes un saludo o no
      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      }else {      
         const response = `Echo: ${message.text.body}`;
         await whatsappService.sendMessage(message.from, response, message.id);
      }
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === 'interactive'){
      const option = message?.interactive?.button_reply?.title.toLowerCase().trim();
      await this.handleMenuOption(message.from, option);
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
    return senderInfo.profile?.name || senderInfo.wa_id || " ";
  }

  //enviar mensaje de bienvenida
  async sendWelcomeMessage(to, messageId, senderInfo){//recibir la infomacion del usuario y el id del mensaje
    const fullName = this.getSenderName(senderInfo);
    const firstName = fullName.split(' ')[0]; // Obtener el primer nombre
    
    const welcomeMessage = `Hola ${firstName}, Te doy la bienvenida a VETPET, Tu tienda de mascotas en línea. ¿En que te puedo ayudar?.`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId); //enviar mensaje de bienvenida
  }

  async sendWelcomeMenu(to){
    const menuMessage = "Elige una opción"
    const buttons =[
      {type: 'reply', reply: {id: 'option_1', title: 'Agendar'}},
      {type: 'reply', reply: {id: 'option_2', title: 'Consultar'}},
      {type: 'reply', reply: {id: 'option_3', title: 'Ubicacion'}}

    ];
    
    await whatsappService.sendInteractiveButttons(to, menuMessage, buttons);
  }

  async handleMenuOption(to, option){
    let response;
  switch (option) {
    case 'agendar':
      response = 'Agendar una Cita';      
      break;
    case 'consultar':
      response = ' Realizar una consulta';
      break;
    case 'ubicacion':
      response = 'Esta es nuestra ubicación';
      break;
    default:
      response = 'Lo siento, no entendí tu selección, por favor intenta de nuevo';
      break;
  }

  await whatsappService.sendMessage(to, response);
  
  }

}

export default new MessageHandler();