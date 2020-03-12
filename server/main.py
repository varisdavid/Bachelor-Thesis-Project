from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='../client', static_url_path='/')


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False

db = SQLAlchemy(app)

class Employee(db.Model):
    personID = db.Column(db.String, primary_key=True)
    name = db.Column(db.String, nullable=False)
    isAdmin = db.Column(db.Boolean, nullable=False)
    isBoss = db.Column(db.Boolean, nullable=False)

    def __repr__(self):
        return '<Employee {}: {} {} {}>'.format(self.personID, self.name, self.isAdmin, self.isBoss)

    def serialize(self):
        return dict(personID=self.personID, name=self.name, isAdmin=self.isAdmin, isBoss=self.isBoss)

class Person_Activity(db.Model):
    personId = db.Column(db.String, db.ForeignKey('Employee.personID'), primary_key=True)
    id = db.Column(db.Integer, db.ForeignKey('Activity.id'), primary_key=True)

    def __repr__(self):
        return '<Person_Activity {} {}:>'.format(self.personID, self.id)

    def serialize(self):
        return dict(personID=self.personID, id=self.id)

@app.route("/")
def client(): 
    return app.send_static_file("client.html")

if __name__ == "__main__":
    app.run()
