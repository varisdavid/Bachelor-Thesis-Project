from flask import Blueprint, request, jsonify
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

# You can import the database from a blueprint
from server.database import db, Employee
from server import app

jwt = JWTManager(app)

# Creates the blueprint
bp = Blueprint('employee', __name__, url_prefix='/employee')

# Route for fetching the entire employee table and adding an employee
@bp.route('/all', methods=['GET', 'POST'])
@jwt_required
def employees():
    user_id = get_jwt_identity()
    company = Employee.query.get(user_id).company
    if request.method == 'GET':
        employeeList = []
        employees = Employee.query.all()
        for i in employees:
            if i.company == company:
                employeeadd = i.serialize()
                employeeList.append(employeeadd)
        return jsonify(employeeList)
    if request.method == 'POST':
        #if employee.isAdmin:
        jsonData = request.get_json()
        db.session.add(Employee(personID=jsonData['personID'], email=jsonData['email'], name=jsonData['name'],
                                isAdmin=False, isBoss=False, company=employee.company, passwordHash = bcrypt.generate_password_hash("halla").decode('utf-8'), usingDefaultPassword=True))
        db.session.commit()
        return 200
        #Employee.query.get_or_404(jsonData['personID']).serialize(), 200
        #else:
        #return {"msg": "Not authorized"}, 401

# Route for fetsching one employee, editing one employee and removing one employee
@bp.route("/<int:pID>", methods=['GET', 'PUT', 'DELETE'])
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



