chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processCommand") {
        console.log("Processing command:", request.text);

        fetch("http://127.0.0.1:5000/process_audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: request.text })
        })
        .then(response => response.json())
        .then(data => {
            if (data.script) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (script) => { eval(script); },
                        args: [data.script]
                    });
                });

                // Send message to content.js for voice response
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: "speak", text: data.response });
                });
            }
        })
        .catch(error => console.error("Error processing command:", error));
    }
});