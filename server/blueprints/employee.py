from flask import Blueprint, request, jsonify, Response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

# You can import the database from a blueprint
from server.database import db, Employee, Company, Project
from server import app

bcrypt = Bcrypt(app)

# Creates the blueprint
bp = Blueprint('employee', __name__, url_prefix='/employee')

# Route for fetching the entire employee table and adding an employee
@bp.route("/all", methods=['GET', 'POST'])
@jwt_required
def employees():
    user_id = get_jwt_identity()
    user = Employee.query.get_or_404(user_id)
    if request.method == 'GET':
        employeeList = Employee.query.all()
        serializedEmployeeList = []
        for i in range(len(employeeList)):
            if user.company == employeeList[i].company:
                employeeList[i] = Employee.serialize(employeeList[i])
                serializedEmployeeList.append(employeeList[i])
        return jsonify(serializedEmployeeList)
    if request.method == 'POST':
        if user.isAdmin:
            jsonData = request.get_json()
            db.session.add(Employee(personID=jsonData['personID'], email=jsonData['email'], name=jsonData['name'],
                                    isAdmin=jsonData['isAdmin'], isBoss=jsonData['isBoss'], company=user.company, passwordHash = bcrypt.generate_password_hash("halla").decode('utf-8'), usingDefaultPassword=True))
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize(), 200
        else:
            return {"msg": "Not authorized"}, 401

# Route for fetsching one employee, editing one employee and removing one employee
@bp.route("/<string:pID>", methods=['GET', 'PUT', 'DELETE'])
@jwt_required
def employee(pID):
    user_id = get_jwt_identity()
    user = Employee.query.get_or_404(user_id)

    if request.method == 'GET':
        employee = Employee.query.filter_by(personID=pID).first_or_404()
        if user.company == employee.company:
            serializedEmployee = Employee.serialize(employee)
            return jsonify(serializedEmployee)
        else:
            return {"msg": "Not authorized"}, 401
    if request.method == 'PUT':
        if user.isAdmin:
            user = Employee.query.filter_by(personID=pID).first_or_404()
            jsonData = request.get_json()
            if jsonData['personID'] != None and jsonData['personID'] != "":
                user.personID=jsonData['personID']
            if jsonData['name'] != None and jsonData['name'] != "":
                user.name=jsonData['name']
            if jsonData['email'] != None and jsonData['email'] != "":
                user.email=jsonData['email']
            if jsonData['isAdmin'] != None and jsonData['isAdmin'] != "":
                user.isAdmin=jsonData['isAdmin']
            if jsonData['isBoss'] != None and jsonData['isBoss'] != "":
                user.isBoss=jsonData['isBoss']
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize()
        else: 
            return {"msg": "Not authorized"}, 401

    if request.method == 'DELETE':
        if user.isAdmin:
            employee = Employee.query.filter_by(personID=pID).first_or_404()
            if user.company == employee.company:
                serializedEmployee = Employee.serialize(employee)
                db.session.delete(employee)
                db.session.commit()
                return {"msg": "Employee deleted"}, 200
            else:
                return {"msg": "Not authorized"}, 401
        else:
            return {"msg": "Not authorized"}, 401


@bp.route("/getUser", methods=['GET'])
@jwt_required
def getUser():
    user_id = get_jwt_identity()
    employee = Employee.query.get(user_id)
    return jsonify(employee.serialize())
