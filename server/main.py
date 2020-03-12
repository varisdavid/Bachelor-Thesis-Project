from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import DateTime
from datetime import datetime

app = Flask(__name__, static_folder='../client', static_url_path='/')

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False

db = SQLAlchemy(app)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    date = db.Column(DateTime)
    name = db.Column(db.String, nullable = False)
    startTime = db.Column(DateTime)
    stopTime = db.Column(DateTime)
    location = db.Column(db.String, nullable = True)
    description = db.Column(db.String, nullable = True)
    project = db.Column(db.Integer, db.ForeignKey('Project.id'))

    def __repr__(self):
        return '<Activity {} : {} {} {} {} {} {} {} {}>'.format(
            id, date, name, startTime, stopTime, location, description, project)
    def serialize(self):
        return dict(id = self.id, date = self.date, name = self.name, startTime = self.startTime,
        stopTime = self.StopTime, location = self.Location, description = self.description, project = self.project)


@app.route("/")
def client(): 
    return app.send_static_file("client.html")

if __name__ == "__main__":
    app.run()
