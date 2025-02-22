document.getElementById("start").addEventListener("click", () => {
    // Check if the browser supports speech recognition
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
        document.getElementById("response-text").innerText = "Speech recognition not supported in this browser.";
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.start();

    recognition.onstart = () => {
        console.log("Voice recognition started. Speak now...");
    };

    recognition.onresult = async (event) => {
        const command = event.results[0][0].transcript;
        document.getElementById("response-text").innerText = "Recognized: " + command;
        chrome.runtime.sendMessage({ action: "processCommand", text: command });
    };

    recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
            document.getElementById("response-text").innerText = "Microphone access denied. Please allow it in Chrome settings.";
        } else {
            document.getElementById("response-text").innerText = "Error: " + event.error;
        }
    };
});