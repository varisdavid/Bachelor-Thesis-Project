from flask import Blueprint, request, jsonify

#You can import the database from a blueprint
from server.database import db, Employee

#Creates the blueprint
bp = Blueprint('authentication', __name__, url_prefix='/employee')

#Simple example route that uses the database. Make sure that the database is created before testing.
@bp.route("/employee", methods = ['GET', 'POST'])
def employee():
    if request.method == 'GET':
        serializedEmployeeList = [i.serialize() for i in Employee.query.all()]
        return jsonify(serializedEmployeeList)
    if request.method == 'POST':
        jsonData = request.get_json()
        db.session.add(Employee(personID=jsonData['personID'], name=jsonData['name'],
                        isAdmin=jsonData['isAdmin'], isBoss=jsonData['isBoss']))
        db.session.commit()
        return Employee.query.get_or_404(jsonData['personID']).serialize()