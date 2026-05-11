import nodemailer from 'nodemailer';

export const sendEmail = async (clientEmail, clienteStatus) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD 
        }
    });

    const statusMessages = {
        'APPROVED': {
            subject: '¡Bienvenido a Astra Bank! - Solicitud Aprobada',
            body: `Estimado cliente,\n\nEs un placer informarle que su solicitud de cuenta en Astra Bank ha sido APROBADA. A partir de este momento, puede comenzar a disfrutar de todos nuestros servicios financieros.\n\nEn breve recibirá un correo con los pasos para configurar su acceso a la banca en línea.\n\nGracias por confiar en nosotros.`
        },
        'REJECTED': {
            subject: 'Información sobre su solicitud - Astra Bank',
            body: `Estimado cliente,\n\nAgradecemos su interés en Astra Bank. Tras revisar su solicitud, lamentamos informarle que en este momento no podemos proceder con la apertura de su cuenta debido a nuestras políticas de evaluación interna.\n\nValoramos su preferencia y quedamos a su disposición para futuras consultas.`
        }
    };

    // Seleccionamos el mensaje (o uno por defecto si el status no coincide)
    const message = statusMessages[clienteStatus] || {
        subject: 'Estado de su solicitud - Astra Bank',
        body: `Estimado cliente, su solicitud se encuentra actualmente en estado: ${clienteStatus}.`
    };

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: clientEmail,
        subject: message.subject,
        text: message.body
    };

    return transporter.sendMail(mailOptions);
};