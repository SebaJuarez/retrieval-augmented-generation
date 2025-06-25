const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-upload');

// Añadir mensaje al chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');

    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre>$1</pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

    messageDiv.innerHTML = formattedMessage;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enviar pregunta al backend
async function getBotResponse(userMessage) {
    try {
        const response = await fetch('http://127.0.0.1:5000/preguntar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta: userMessage })
        });

        if (!response.ok) throw new Error('Error en la respuesta del servidor');

        const data = await response.json();
        addMessage(data.respuesta, 'bot');
    } catch (error) {
        console.error('Error al consultar /preguntar:', error);
        addMessage('⚠️ Error al obtener la respuesta del servidor.', 'bot');
    }
}

// Enviar mensaje
sendButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (userMessage) {
        addMessage(userMessage, 'user');
        chatInput.value = '';
        getBotResponse(userMessage);
    }
});

// Enter para enviar
chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendButton.click();
});

// Subida de PDFs al hacer click en "+"
fileInput.addEventListener('change', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = fileInput.files;

    if (files.length === 0) {
        addMessage('⚠️ No se seleccionaron archivos.', 'bot');
        return;
    }

    const formData = new FormData();
    for (const file of files) {
        if (file.type === 'application/pdf') {
            formData.append('archivos', file);
        } else {
            addMessage(`⚠️ El archivo "${file.name}" no es un PDF y fue ignorado.`, 'bot');
        }
    }

    try {
        const response = await fetch('http://127.0.0.1:5000/subir', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            addMessage(`✅ Archivos subidos correctamente.`, 'bot');
        } else {
            addMessage(`❌ Error al subir: ${data.error || 'Desconocido'}`, 'bot');
        }
    } catch (error) {
        console.error('Error al subir archivos:', error);
        addMessage('⚠️ Error al subir los archivos al servidor.', 'bot');
    }
});

