# from flask import Flask, request, jsonify
# from flask_cors import CORS  # Import CORS
# import whisper
# from langgraph.graph import StateGraph

# app = Flask(__name__)
# CORS(app)  # Enable CORS for all routes

# model = whisper.load_model("base")

# # Define LangGraph Workflow with State Schema
# class VoiceCommandState:
#     text: str  # Input state

# graph = StateGraph(VoiceCommandState)  # Provide schema

# def process_command(state):
#     text = state.text.strip().lower()  # Ensure text is processed safely
#     commands = {
#         "scroll down": "window.scrollBy(0, 500);",
#         "scroll up": "window.scrollBy(0, -500);",
#         "click submit": "document.querySelector('button[type=submit]').click();",
#         "go to home": "window.location.href = '/';",
#         "search google": "window.location.href = 'https://www.google.com';"
#     }
#     return {"script": commands.get(text, "console.error('Command not recognized: ' + text);")}  # Ensure valid script output

# graph.add_node("voice_processing", process_command)
# graph.set_entry_point("voice_processing")  # Define start node

# @app.route("/process_audio", methods=["POST"])
# def process_audio():
#     data = request.get_json()  # Read JSON body
#     if "text" not in data or not data["text"]:
#         return jsonify({"error": "Missing or empty 'text' field"}), 400
    
#     result = model.transcribe(data["text"])  # Process audio text
#     command_script = graph.invoke(VoiceCommandState(text=result["text"]))

#     return jsonify(command_script)  # Return script

# if __name__ == "__main__":
#     app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import whisper
from langgraph.graph import StateGraph

app = Flask(__name__)
CORS(app)

model = whisper.load_model("base")

class VoiceCommandState:
    text: str

graph = StateGraph(VoiceCommandState)

def process_command(state):
    text = state.text.lower().strip()
    
    commands = {
        "scroll down": "window.scrollBy(0, 500);",
        "scroll up": "window.scrollBy(0, -500);",
        "click submit": "document.querySelector('button[type=submit]').click();",
        "go to home": "window.location.href = '/';",
        "search google": "window.location.href = 'https://www.google.com/search?q=' + encodeURIComponent(prompt('Enter your search query:'))",
        "mute": "document.querySelector('video,audio').muted = true;",
    }

    if text in commands:
        return {"script": commands[text]}
    else:
        return {"script": f"alert('Unknown command: {text}');"}

graph.add_node("voice_processing", process_command)
graph.set_entry_point("voice_processing")

@app.route("/process_audio", methods=["POST"])
def process_audio():
    data = request.get_json()
    if "text" not in data or not data["text"].strip():
        return jsonify({"error": "Missing or empty 'text' field"}), 400

    result = model.transcribe(data["text"])
    command_script = graph.invoke(VoiceCommandState(text=result["text"]))

    return jsonify(command_script)

if __name__ == "__main__":
    app.run(debug=True)