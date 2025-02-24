document.getElementById("start").addEventListener("click", () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        document.getElementById("response-text").innerText = "Recognized: " + command;
        chrome.runtime.sendMessage({ action: "processCommand", text: command });
    };

    recognition.onerror = (event) => {
        document.getElementById("response-text").innerText = "Error: " + event.error;
    };
});