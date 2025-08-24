const chatContainer = document.getElementById("chat-container");
const chatToggle = document.getElementById("chat-toggle");
const chatBox = document.getElementById("chat-box");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

// Generate a unique session ID
const sessionId = generateSessionId();

// Toggle chat on logo click
chatToggle.addEventListener("click", () => {
  chatContainer.classList.toggle("hidden");
  if (!chatContainer.classList.contains("hidden")) {
    // Add a slight delay to ensure the element is visible before adding the class
    setTimeout(() => {
      chatContainer.classList.add("visible");
      input.focus();
    }, 10);
  } else {
    chatContainer.classList.remove("visible");
  }
});

// Create close button
const closeButton = document.createElement("button");
closeButton.id = "close-chat";
closeButton.innerHTML = "×";
closeButton.addEventListener("click", () => {
  chatContainer.classList.add("hidden");
  chatContainer.classList.remove("visible");
});

// Add close button to header
const chatHeader = document.getElementById("chat-header");
chatHeader.appendChild(closeButton);

function appendMessage(text, sender) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typing = document.createElement("div");
  typing.id = "typing-indicator";
  typing.className = "message bot typing";
  typing.innerHTML = "MedyBuddy is typing...";
  chatBox.appendChild(typing);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById("typing-indicator");
  if (typing) typing.remove();
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage(message, "user");
  input.value = "";
  
  showTypingIndicator();

  try {
    const res = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
    });

    const data = await res.json();
    removeTypingIndicator();
    appendMessage(data.reply, "bot");
  } catch (error) {
    removeTypingIndicator();
    appendMessage("⚠️ Error: Could not reach MedyBuddy", "bot");
  }
}

function generateSessionId() {
  return 'session-' + Math.random().toString(36).substr(2, 9);
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Add initial bot message when chat is opened for the first time
chatToggle.addEventListener("click", function firstOpen() {
  if (chatBox.children.length === 0) {
    appendMessage("Hello! I'm MedyBuddy. How can I help you today?", "bot");
  }
  chatToggle.removeEventListener("click", firstOpen);
});