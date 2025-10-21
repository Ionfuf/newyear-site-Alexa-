from flask import Flask, render_template, jsonify, send_from_directory
import json, os

app = Flask(__name__, static_folder="static", template_folder="templates")

@app.route("/api/data")
def data():
    with open("data.json", "r", encoding="utf-8") as f:
        return jsonify(json.load(f))

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/music/<path:filename>")
def music(filename):
    return send_from_directory(os.path.join(app.static_folder, "music"), filename)

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
