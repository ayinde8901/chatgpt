// DOM Elements
const chatBody = document.querySelector('.chat-body');
const messageInput = document.querySelector('.message-input');
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector('#file-input');
const closeChatButton = document.querySelector('#close-chat');
const fileUploadButton = document.querySelector('#file-upload');
const fileCancelButton = document.querySelector('#file-cancel');
const fileUploadWrapper = document.querySelector('.file-upload-wrapper');
const chatForm = document.querySelector('.chat-form');
const emojiButton = document.getElementById('emoji-picker');
const chatbottogler = document.querySelector("#chatbot-toggler")
const closechatbot = document.querySelector("#close-chat")

// API Configuration
const API_KEY = 'AIzaSyDeg8snOsc2o-AORNes0BS7527sZ0wAbHQ';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

// User data storage
const userData = {
    message: null,
    file: null
};





// Create message element with dynamic classes
const createMessageElement = (content, ...classes) => {
    const div = document.createElement('div');
    div.classList.add('message', ...classes);
    div.innerHTML = content;
    return div;
};

// Generate bot response
const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector('.message-text');
    
    try {
        const parts = [{ text: userData.message || "Describe this image" }];
        
        if (userData.file) {
            parts.push({
                inline_data: {
                    mime_type: userData.file.type,
                    data: userData.file.data.split(',')[1]
                }
            });
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: parts
                }]
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error("API Error:", data);
            throw new Error(data.error?.message || "Failed to get response from AI");
        }

        const responseText = data.candidates[0]?.content?.parts[0]?.text
            ?.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            ?.trim() || "I couldn't generate a response. Please try again.";
        
        messageElement.innerHTML = responseText;
        
    } catch (error) {
        console.error("Error:", error);
        messageElement.innerHTML = "Sorry, I encountered an error. Please try again.";
    } finally {
        incomingMessageDiv.classList.remove('thinking');
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
        userData.file = null;
    }
};

// Reset file upload UI
const resetFileUpload = () => {
    fileUploadWrapper.classList.remove("file-uploaded");
    fileUploadWrapper.querySelector("img").src = "";
    fileInput.value = "";
    userData.file = null;
    fileCancelButton.style.display = "none";
};

// Handle outgoing messages
const handleOutgoingMessage = (e) => {
    e.preventDefault();
    
    const message = messageInput.value.trim();
    if (!message && !userData.file) return;
    
    userData.message = message;
    messageInput.value = '';
    
    const messageContent = `
        ${userData.message ? `<div class="message-text">${userData.message}</div>` : ''}
        ${userData.file ? `<img src="${userData.file.data}" class="attachment" alt="Uploaded image"/>` : ""}
    `;
    
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });

    resetFileUpload();

    setTimeout(() => {
        const thinkingContent = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024" class="avatar">
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
            </svg>
            <div class="message-text">
                <div class="thinking-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        
        const incomingMessageDiv = createMessageElement(thinkingContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });
        
        generateBotResponse(incomingMessageDiv);
    }, 1000);
};

// Handle file uploads
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        fileUploadWrapper.querySelector("img").src = e.target.result;
        fileUploadWrapper.classList.add("file-uploaded");
        userData.file = {
            type: file.type,
            data: e.target.result
        };
        fileCancelButton.style.display = "flex"
    };
    reader.readAsDataURL(file);
});


const pickerContainer = document.createElement('div');
pickerContainer.className = 'emoji-picker';
document.body.appendChild(pickerContainer);

new EmojiMart.Picker({
  parent: pickerContainer,
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    messageInput.value += emoji.native;
    messageInput.focus();
  }
});

const initialInputHeight = messageInput.scrollHeight;

// adjust input field height dynmamically 

messageInput.addEventListener("input",()=>{
    messageInput.style.height = `${initialInputHeight}px`;
    messageInput.style.height = `${messageInput.scrollHeight}px`;
    document.querySelector(".chat-form").style.borderRadius =messageInput.scrollHeight >initialInputHeight ? "15px"  : "32px"
    initial
})




// Event listeners
fileUploadButton.addEventListener("click", () => fileInput.click());
fileCancelButton.addEventListener("click", (e) => {
    e.stopPropagation();
    resetFileUpload();
    fileCancelButton.style.display = "none"; 
});

closeChatButton.addEventListener("click", () => {
    document.querySelector('.chat-pop').classList.toggle('minimized');
});

messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (messageInput.value.trim() || userData.file) {
            handleOutgoingMessage(e);
        }
    }
});

// initiallize emoji picker 




emojiButton.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    pickerContainer.classList.toggle('visible');
  });
  
  document.addEventListener('click', function(e) {
    if (!pickerContainer.contains(e.target) && e.target !== emojiButton) {
      pickerContainer.classList.remove('visible');
    }
  });

sendMessageButton.addEventListener("click", handleOutgoingMessage);
chatForm.addEventListener("submit", handleOutgoingMessage);
chatbottogler.addEventListener("click",()=> document.body.classList.toggle("show-chatbot"))
closechatbot.addEventListener("click",()=>document.body.classList.remove("show-chatbot"))