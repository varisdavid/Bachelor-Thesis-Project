from flask import Flask

app = Flask(__name__)

@app.route("/")
def client():
    return app.send_static_file("client.html")

if __name__ == "__main__":
    app.run()