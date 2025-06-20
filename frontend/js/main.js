
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

// Función para añadir un mensaje al chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    // Simplificación para mostrar algo de Markdown (solo negritas, cursivas, código)
    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas
        .replace(/\*(.*?)\*/g, '<em>$1</em>'); // Cursivas (puede chocar con negritas si no se hace bien, es un ejemplo simple)

    // Para bloques de código simples (pre)
    formattedMessage = formattedMessage.replace(/```(.*?)```/gs, '<pre>$1</pre>');
    // Para código en línea (code)
    formattedMessage = formattedMessage.replace(/`(.*?)`/g, '<code>$1</code>');


    messageDiv.innerHTML = formattedMessage;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Desplazar hasta el último mensaje
}

// Simula la respuesta del "bot" (en un caso real, aquí iría la llamada a tu LLM)
async function getBotResponse(userMessage) {
    try {
        const response = await fetch('http://127.0.0.1:5000/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: userMessage })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        addMessage(data.answer, 'bot IA');
    } catch (error) {
        console.error('Error al llamar a /ask:', error);
        return 'Hubo un problema al obtener la respuesta del servidor.';
    }
}

// Manejar el envío de mensajes
sendButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, 'user');
        chatInput.value = ''; // Limpiar el input

        // Simular una respuesta del bot después de un breve retraso
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            addMessage(botResponse, 'bot');
        }, 500); // Retraso de 0.5 segundos
    }
});

// Permitir enviar mensaje con la tecla Enter
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

// Función para el mensaje inicial del bot al cargar la página
window.onload = () => {
    // Ya está añadido en el HTML, pero si quisieras añadirlo dinámicamente:
    // addMessage('Hola, soy tu asistente IA básico. ¿En qué puedo ayudarte?', 'bot');
};