import { response } from 'express';
import whatsappService from './whatsappService.js';

class MessageHandler {
  
  constructor(){
    this.appointmentState = {};
  }
  
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === 'text') {
      //covertir el mensaje a minusculas y quitar espacios
      const incomingMessage = message.text.body.toLowerCase().trim();

      //validar si el mensajes un saludo o no
      if(this.isGreeting(incomingMessage)){
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      }else if (this.appointmentState[message.from]) {
        // Manejar el flujo de citas
        await this.handleAppointmentFlow(message.from, incomingMessage);
      }else if(incomingMessage === 'media'){
        await this.sendMedia(message.from);
      }else{      
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
      this.appointmentState[to] = {step: 'name'};
      response = "Por favor, ingresa tu nombre:";
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

  async sendMedia(to) {
    /*  const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-audio.aac';
     const caption = 'Bienvenida';
     const type = 'audio'; */

    // const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-imagen.png';
    // const caption = '¡Esto es una Imagen!';
    // const type = 'image';

    const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-video.mp4';
    const caption = '¡Esto es una video!';
    const type = 'video';

    //const mediaUrl = 'https://s3.amazonaws.com/gndx.dev/medpet-file.pdf';
    //const caption = '¡Esto es un PDF!';
    //const type = 'document';

    await whatsappService.sendMediaMessage(to, type, mediaUrl, caption);
  } 

  completeAppointment(to){
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData =[
      to,
      appointment.name,
      appointment.petName,
      appointment.petType,
      appointment.reason,
      new Date().toISOString()
    ]
    console.log(userData);

    return `Gracias por agendar tu cita.
    Resumen de la cita:
    Nombre: ${appointment.name}
    Nombre de la mascota: ${appointment.petName}
    Tipo de mascota: ${appointment.petType}
    Motivo de la consulta: ${appointment.reason}
    
    Nos pondremos en contacto contigo para confirmar la fecha y la hora de la cita.`;
  }


  async handleAppointmentFlow(to, message){
    const state = this.appointmentState[to];
    let response;

    switch(state.step){
      case 'name':
        state.name = message;
        state.step = 'petName';
        response = "Gracias, Ahora, por favor, dime el nombre de tu mascota";
        break;
        case 'petName':
          state.petName = message;
          state.step = 'petType';
          response = "Gracias, Ahora, por favor, dime el tipo de mascota (Perro, Gato, etc)";
          break;
        case 'petType':
          state.petType = message;
          state.step = 'reason';
          response = "Gracias, Ahora, por favor, dime el motivo de la consulta";
          break;
        case 'reason':
          state.reason = message;
          response = this.completeAppointment(to);
          break;
    }
    await whatsappService.sendMessage(to, response);
  }

}

export default new MessageHandler();