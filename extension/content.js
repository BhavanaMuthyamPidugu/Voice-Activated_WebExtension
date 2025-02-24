chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "speak") {
      const utterance = new SpeechSynthesisUtterance(request.text);
      window.speechSynthesis.speak(utterance);
  }
});