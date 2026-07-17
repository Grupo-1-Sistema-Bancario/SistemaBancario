import axios from 'axios';

export const sendEmail = async (clientEmail, clienteStatus) => {
    const statusMessages = {
        'APPROVED': {
            subject: '¡Bienvenido a Astra Bank! - Solicitud Aprobada',
            body: `Estimado cliente,\n\nEs un placer informarle que su solicitud de cuenta en Astra Bank ha sido APROBADA. A partir de este momento, puede comenzar a disfrutar de todos nuestros servicios financieros.\n\nGracias por confiar en nosotros.`
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

    const apiKey = process.env.BREVO_API_KEY;
    const emailFrom = process.env.EMAIL_FROM || 'grupo1in6bv@gmail.com';
    const emailFromName = process.env.EMAIL_FROM_NAME || 'Banco App';

    if (!apiKey) {
        throw new Error('BREVO_API_KEY is not configured in the environment variables');
    }

    const payload = {
        sender: {
            name: emailFromName,
            email: emailFrom
        },
        to: [
            {
                email: clientEmail
            }
        ],
        subject: message.subject,
        textContent: message.body,
        htmlContent: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">${message.body.replace(/\n/g, '<br>')}</div>`
    };

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
        headers: {
            'api-key': apiKey,
            'content-type': 'application/json',
            'accept': 'application/json'
        }
    });

    return response.data;
};