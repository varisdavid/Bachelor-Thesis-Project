from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, static_folder='../client', static_url_path='/')


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False

db = SQLAlchemy(app)


class LoggedWork(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    employeeID = db.Column(db.Integer, db.ForeignKey(
        'Employee.id'), nullable=False)
    projectID = db.Column(db.Integer, db.ForeignKey(
        'Project.id'), nullable=False)
    approved = db.Column(db.Boolean, default=True)
    startTime = db.Column(db.Integer, nullable=False)
    endTime = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.String, nullable=True)
    petrolCost = db.Column(db.Integer, nullable=True)
    otherCost = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return '<LoggedWork {}: {} {} {} {} {} {} {} {}>'.format(self.id, self.personID, self.projectID, self.approved, self.startTime, self.endTime, self.comment, self.petrolCost, self.otherCost)

    def serialize(self):
        return dict(id=self.id, employeeID=self.employeeID, projectID=self.projectID, approved=self.approved, startTime=self.startTime, endTime=self.endTime, comment=self.comment, petrolCost=self.petrolCost, otherCost=self.otherCost)


@app.route("/")
def client():
    return app.send_static_file("client.html")


if __name__ == "__main__":
    app.run()
