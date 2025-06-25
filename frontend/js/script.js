const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-upload');
const uploadButton = document.getElementById('upload-button');
const loader = document.getElementById('loader');

// Agregar un mensaje al chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble', sender === 'user' ? 'user-message' : 'bot-message');

    let formattedMessage = message
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```(.*?)```/gs, '<pre>$1</pre>')
        .replace(/`(.*?)`/g, '<code>$1</code>');

    messageDiv.innerHTML = formattedMessage;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mostrar loader
function showLoader() {
    loader.style.display = 'block';
}

// Ocultar loader
function hideLoader() {
    loader.style.display = 'none';
}

// Enviar mensaje
sendButton.addEventListener('click', () => {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    addMessage(userMessage, 'user');
    chatInput.value = '';
    getBotResponse(userMessage);
});

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') sendButton.click();
});

// Obtener respuesta del backend con loader
async function getBotResponse(userMessage) {
    showLoader();
    try {
        const response = await fetch('http://127.0.0.1:5000/preguntar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pregunta: userMessage })
        });

        const data = await response.json();
        addMessage(data.respuesta || '❌ Error del servidor', 'bot');
    } catch (error) {
        console.error('Error en /preguntar:', error);
        addMessage('❌ No se pudo conectar con el servidor.', 'bot');
    } finally {
        hideLoader();
    }
}

// Botón + abre selector de archivos
uploadButton.addEventListener('click', (event) => {
    event.preventDefault();
    fileInput.click();
});

// Subida de PDFs con loader
fileInput.addEventListener('change', async (event) => {
    event.preventDefault();
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

    addMessage('Indexando archivos...', 'bot')
    showLoader();
    try {
        const response = await fetch('http://127.0.0.1:5000/subir', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            // Mostrar el mensaje que devuelve el backend
            addMessage(data.mensaje || '✅ Archivos subidos correctamente.', 'bot');
        } else {
            addMessage(`❌ Error al subir: ${data.error || 'Desconocido'}`, 'bot');
        }
    } catch (error) {
        console.error('Error al subir archivos:', error);
        addMessage('⚠️ Error al subir los archivos al servidor.', 'bot');
    } finally {
        hideLoader();
    }
});

