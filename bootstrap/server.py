from flask import Flask, render_template, request
import qbittorrentapi

app = Flask(__name__)
app.config['DEBUG'] = True

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/bootstrap", methods=['POST'])
def bootstrap():
    print (request.json['magnet'])

    return "OK"

if __name__ == "__main__":
    app.run(host='localhost', port=4000)
