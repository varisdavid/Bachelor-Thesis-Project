from flask import Blueprint

#You can import the database from a blueprint
from server.database import db, Employee

#Creates the blueprint
bp = Blueprint('authentication', __name__, url_prefix='/auth')

#Defines a route that can be accessed through localhost:5000/auth/ping
@bp.route("/ping")
def hello():
    return "ok"

#Simple example route that uses the database. Make sure that the database is created before testing.
@bp.route("/addemployee")
def addEmployee():
    emp = Employee(personID="00000000-0001", name="Pelle", isAdmin=False, isBoss=False)
    db.session.add(emp)
    db.session.commit()
    return "ok"