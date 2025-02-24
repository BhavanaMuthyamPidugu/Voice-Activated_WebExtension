from flask import Flask, request, jsonify
from flask_cors import CORS
import pyttsx3  # Text-to-Speech (TTS)
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode

app = Flask(__name__)
CORS(app)

# Initialize Text-to-Speech (TTS)
tts_engine = pyttsx3.init()

class VoiceCommandState:
    text: str

graph = StateGraph(VoiceCommandState)

def process_command(state):

    """
    Processes a voice command and returns a corresponding JavaScript action.

    Args:
        state (dict): Contains the voice command text.

    Returns:
        dict: Contains the JavaScript command and voice response.
    """
    text = state.text.lower().strip()
    
    commands = {
        # Common commands (work on all pages)
        "scroll down": ("Scrolling down...", "window.scrollBy(0, 500);"),
        "scroll up": ("Scrolling up...", "window.scrollBy(0, -500);"),
        "go to top": ("Going to the top of the page.", "window.scrollTo(0, 0);"),
        "go to bottom": ("Scrolling to the bottom.", "window.scrollTo(0, document.body.scrollHeight);"),
        "zoom in": ("Zooming in.", "document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) + 0.1) + '';"),
        "zoom out": ("Zooming out.", "document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) - 0.1) + '';"),

        # GitHub Commands
        "new issues": ("Opening issues page on GitHub.", "document.querySelector('a[href$=\"/issues\"]').click();"),
        "view pull requests": ("Opening pull requests page.", "document.querySelector('a[href$=\"/pulls\"]').click();"),
        "star repository": ("Starring the repository.", "document.querySelector('button[aria-label=\"Star this repository\"]').click();"),

        # Google Commands
        "search google": ("Opening Google search.", "window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(prompt('Enter your search query:'));"),
        "open images": ("Going to Google Images.", "window.location.href = 'https://www.google.com/imghp';"),
        
        # YouTube Commands
        "play video": ("Playing video.", "document.querySelector('video').play();"),
        "pause video": ("Pausing video.", "document.querySelector('video').pause();"),
        "like video": ("Liking the video.", "document.querySelector('button[aria-label=\"Like this video\"]').click();"),
        "subscribe": ("Subscribing to the channel.", "document.querySelector('button[aria-label=\"Subscribe\"]').click();"),

        # Twitter Commands
        "like tweet": ("Liking the tweet.", "document.querySelector('div[data-testid=\"like\"]').click();"),
        "retweet": ("Retweeting.", "document.querySelector('div[data-testid=\"retweet\"]').click();"),
        
        # Gmail Commands
        "open inbox": ("Opening Gmail inbox.", "window.location.href = 'https://mail.google.com/mail/u/0/#inbox';"),
        "compose email": ("Opening email composer.", "document.querySelector('div[role=\"button\"][gh=\"cm\"]').click();"),
    }

    if text in commands:
        response_text, script = commands[text]
    else:
        response_text = f"Command '{text}' not recognized. Please try again."
        script = f"alert('{response_text}');"

    # Convert response text to speech
    tts_engine.say(response_text)
    tts_engine.runAndWait()

    return {"script": script, "response": response_text}

graph.add_node("voice_processing", ToolNode([process_command])) 
graph.set_entry_point("voice_processing")

# **Fix: Compile the graph before invoking**
executor = graph.compile()

@app.route("/process_audio", methods=["POST"])
def process_audio():
    data = request.get_json()
    if "text" not in data or not data["text"].strip():
        return jsonify({"error": "Missing or empty 'text' field"}), 400

    # Correct way to run LangGraph workflow
    result = executor.invoke({"text": data["text"]})

    return jsonify(result)  # Return script & response text

if __name__ == "__main__":
    app.run(debug=True)

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# import whisper
# from langgraph.graph import StateGraph

# app = Flask(__name__)
# CORS(app)

# model = whisper.load_model("base")

# class VoiceCommandState:
#     text: str

# graph = StateGraph(VoiceCommandState)

# def process_command(state):
#     text = state.text.lower().strip()
    
#     commands = {
#         "scroll down": "window.scrollBy(0, 500);",
#         "scroll up": "window.scrollBy(0, -500);",
#         "click submit": "document.querySelector('button[type=submit]').click();",
#         "go to home": "window.location.href = '/';",
#         "search google": "window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(prompt('Enter your search query:'))",
#         "mute": "document.querySelector('video,audio').muted = true;",

#         # GitHub-specific commands
#         "start repo":"document.querySelector('a[href$=\"/new\"]').click();",
#         "view issues": "document.querySelector('a[href$=\"/issues\"]').click();",
#         "view pull requests": "document.querySelector('a[href$=\"/pulls\"]').click();",
#         "star repository": "document.querySelector('button[aria-label=\"Star this repository\"]').click();"
#     }

#     if text in commands:
#         return {"script": commands[text]}
#     else:
#         return {"script": f"alert('Unknown command: {text}');"}

# graph.add_node("voice_processing", process_command)
# graph.set_entry_point("voice_processing")

# @app.route("/process_audio", methods=["POST"])
# def process_audio():
#     data = request.get_json()
#     if "text" not in data or not data["text"].strip():
#         return jsonify({"error": "Missing or empty 'text' field"}), 400

#     result = model.transcribe(data["text"])
#     command_script = graph.invoke(VoiceCommandState(text=result["text"]))

#     return jsonify(command_script)

# if __name__ == "__main__":
#     app.run(debug=True)