chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "processCommand") {
        console.log("Processing command:", request.text);

        fetch("http://127.0.0.1:5000/process_audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: request.text })  // Ensure correct format
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { throw new Error(text); });
            }
            return response.json();
        })
        .then(data => {
            if (data.script) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.scripting.executeScript({
                        target: { tabId: tabs[0].id },
                        func: (script) => { eval(script); },  // Ensure execution
                        args: [data.script]
                    });
                });

                // Send message to content.js to handle TTS for bot response
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: "speak", 
                        text: data.response || "Executing: " + request.text 
                    });
                });
            } else {
                console.error("No script returned:", data);

                // Notify user that the command is not recognized
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: "speak", 
                        text: "Command not recognized. Please try again." 
                    });
                });
            }
        })
        .catch(error => console.error("Error processing command:", error));
    }
});

// Text-to-Speech function (Only used in content.js now)
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

// Detect URL changes and adapt behavior
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        console.log("Website changed:", changeInfo.url);

        // Define actions based on the website
        const siteCommands = {
            "youtube.com": ["play video", "pause video", "mute", "like video", "subscribe"],
            "twitter.com": ["like tweet", "retweet", "scroll tweets", "open notifications"],
            "google.com": ["search", "open first result", "go to images"],
            "github.com": ["star repo", "view issues", "view pull requests", "fork repository"],
            "mail.google.com": ["open inbox", "compose email", "refresh inbox"]
        };

        // Notify the user about available commands
        for (let site in siteCommands) {
            if (changeInfo.url.includes(site)) {
                chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, { 
                        action: "speak", 
                        text: "You are now on " + site + ". You can say: " + siteCommands[site].join(", ") 
                    });
                });
            }
        }
    }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "processCommand") {
//         console.log("Processing command:", request.text);

//         fetch("http://127.0.0.1:5000/process_audio", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ text: request.text })  // Ensure correct format
//         })
//         .then(response => {
//             if (!response.ok) {
//                 return response.text().then(text => { throw new Error(text); });
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.script) {
//                 chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//                     chrome.scripting.executeScript({
//                         target: { tabId: tabs[0].id },
//                         function: new Function(data.script) // Execute JavaScript command
//                     });
//                 });

//                 // Speak the response using TTS
//                 speak("Executing: " + request.text);
//             } else {
//                 console.error("No script returned:", data);
//             }
//         })
//         .catch(error => console.error("Error processing command:", error));
//     }
// });

// // Text-to-Speech function
// function speak(text) {
//     const utterance = new SpeechSynthesisUtterance(text);
//     window.speechSynthesis.speak(utterance);
// }

// // Detect URL changes and adapt behavior
// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//     if (changeInfo.url) {
//         console.log("Website changed:", changeInfo.url);

//         // Define actions based on the website
//         const siteCommands = {
//             "youtube.com": ["play video", "pause video"],
//             "twitter.com": ["like tweet", "retweet"],
//         };

//         // Adapt chatbot behavior dynamically
//         for (let site in siteCommands) {
//             if (changeInfo.url.includes(site)) {
//                 speak("You are now on " + site + ". You can say: " + siteCommands[site].join(", "));
//             }
//         }
//     }
// });