from flask import Flask

app = Flask(__name__, static_folder='../client', static_url_path='/')
from database import *

@app.route("/")
def client(): 
    return app.send_static_file("client.html")

if __name__ == "__main__":
    app.run()
