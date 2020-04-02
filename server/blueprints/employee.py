from flask import Blueprint, request, jsonify

# You can import the database from a blueprint
from server.database import db, Employee

# Creates the blueprint
bp = Blueprint('authentication', __name__, url_prefix='/employee')

# Route for fetching the entire employee table and adding an employee
@bp.route("/employees", methods=['GET', 'POST'])
def employees():
    if request.method == 'GET':
        serializedEmployeeList = [i.serialize() for i in Employee.query.all()]
        return jsonify(serializedEmployeeList)

    if request.method == 'POST':
        jsonData = request.get_json()
        db.session.add(Employee(personID=jsonData['personID'], name=jsonData['name'],
                                isAdmin=jsonData['isAdmin'], isBoss=jsonData['isBoss']))
        db.session.commit()
        return Employee.query.get_or_404(jsonData['personID']).serialize()

# Route for fetsching one employee, editing one employee and removing one employee
@bp.route("<int:pID>", methods=['GET', 'PUT', 'DELETE'])
def employee(pID):
    if request.method == 'GET':
        employee = Employee.query.filter_by(personID=pID).first_or_404()
        serializedEmployee = Employee.serialize(employee)
        return jsonify(serializedEmployee)

    if request.method == 'PUT':
        employee = Employee.query.filter_by(personID=pID).first_or_404()
        jsonData = request.get_json()
        employee.personID=jsonData['personID']
        employee.name=jsonData['name']
        employee.isAdmin=jsonData['isAdmin']
        employee.isBoss=jsonData['isBoss']
        db.session.commit()
        return Employee.query.get_or_404(jsonData['personID']).serialize()

    if request.method == 'DELETE':
        employee = Employee.query.filter_by(personID=pID).first_or_404()
        serializedEmployee = Employee.serialize(employee)
        db.session.delete(employee)
        db.session.commit()
        return jsonify(serializedEmployee)



