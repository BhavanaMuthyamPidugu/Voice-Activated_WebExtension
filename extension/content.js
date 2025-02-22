const chatWidget = document.createElement("div");
chatWidget.innerHTML = `
  <style>
    #voice-chatbot {
      position: fixed; bottom: 20px; right: 20px; width: 320px; height: 420px;
      background: white; border: 1px solid #ddd; padding: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
      border-radius: 10px; padding: 15px;
    }
    #voice-chatbot button { width: 100%; padding: 10px; margin-top: 10px; border-radius: 5px; cursor: pointer; }
    #voice-response { font-size: 14px; color: black; margin-top: 10px; }
  </style>
  <div id="voice-chatbot">
    <button id="voice-command-btn">🎤 Speak</button>
    <div id="voice-response">Waiting for command...</div>
  </div>
`;
document.body.appendChild(chatWidget);

document.getElementById("voice-command-btn").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        document.getElementById("voice-response").innerText = "Recognized: " + command;
        chrome.runtime.sendMessage({ action: "processCommand", text: command });
    };
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "speak") {
      const utterance = new SpeechSynthesisUtterance(request.text);
      window.speechSynthesis.speak(utterance);
  }
});

// const chatWidget = document.createElement("div");
// chatWidget.innerHTML = `
//   <style>
//     #voice-chatbot {
//       position: fixed; bottom: 20px; right: 20px; width: 300px; height: 400px;
//       background: white; border: 1px solid #ddd; padding: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
//     }
//     #voice-chatbot button { width: 100%; padding: 10px; margin-top: 10px; }
//   </style>
//   <div id="voice-chatbot">
//     <button id="voice-command-btn">🎤 Speak</button>
//     <div id="response-text"></div>
//   </div>
// `;
// document.body.appendChild(chatWidget);

// document.getElementById("voice-command-btn").addEventListener("click", () => {
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.lang = "en-US";
//     recognition.start();

//     recognition.onresult = async (event) => {
//         const command = event.results[0][0].transcript;
//         chrome.runtime.sendMessage({ action: "processCommand", text: command });
//     };
// });

// document.getElementById("voice-command-btn").addEventListener("click", () => {
//   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//   recognition.lang = "en-US";
//   recognition.start();

//   recognition.onresult = async (event) => {
//       const command = event.results[0][0].transcript;
//       document.getElementById("response-text").innerText = "Recognized: " + command;
//       chrome.runtime.sendMessage({ action: "processCommand", text: command });
//   };

//   recognition.onerror = (event) => {
//       document.getElementById("response-text").innerText = "Error: " + event.error;
//   };
// });