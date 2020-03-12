from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False

db = SQLAlchemy(app)
app = Flask(__name__, static_folder='../client', static_url_path='/')




@app.route("/")
def client(): 
    return app.send_static_file("client.html")

if __name__ == "__main__":
    app.run()
