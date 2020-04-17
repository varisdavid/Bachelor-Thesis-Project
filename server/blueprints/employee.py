from flask import Blueprint, request, jsonify, Response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

# You can import the database from a blueprint
from server.database import db, Employee, Company, Project
from server import app

# random string
app.config['JWT_SECRET_KEY'] = "GwzrtfCta1xDHgwfBVo0"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Creates the blueprint
bp = Blueprint('employee', __name__, url_prefix='/employee')

# Route for fetching the entire employee table and adding an employee
@bp.route("/all", methods=['GET', 'POST'])
@jwt_required
def employees():
    user_id = get_jwt_identity()
    employee = Employee.query.get_or_404(user_id)
    if request.method == 'GET':
        if employee:
            serializedEmployeeList = [emp.serialize() for emp in Employee.query.all()]
            return jsonify(serializedEmployeeList)
        else:
            return {"msg": "Not authorized"}, 401
    if request.method == 'POST':
        if employee.isAdmin:
            jsonData = request.get_json()
            db.session.add(Employee(personID=jsonData['personID'], email=jsonData['email'], name=jsonData['name'],
                                    isAdmin=False, isBoss=False, company=employee.company, passwordHash = bcrypt.generate_password_hash("halla").decode('utf-8'), usingDefaultPassword=True))
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize(), 200
        else:
            return {"msg": "Not authorized"}, 401

# Route for fetsching one employee, editing one employee and removing one employee
@bp.route("/<string:pID>", methods=['GET', 'PUT', 'DELETE'])
@jwt_required
def employee(pID):
    user_id = get_jwt_identity()
    employee = Employee.query.get_or_404(user_id)

    if request.method == 'GET':
        employee = Employee.query.filter_by(personID=pID).first_or_404()
        serializedEmployee = Employee.serialize(employee)
        return jsonify(serializedEmployee)
    if request.method == 'PUT':
        if employee.isAdmin:
            employee = Employee.query.filter_by(personID=pID).first_or_404()
            jsonData = request.get_json()
            if jsonData['personID'] != None and jsonData['personID'] != "":
                employee.personID=jsonData['personID']
            if jsonData['name'] != None and jsonData['name'] != "":
                employee.name=jsonData['name']
            if jsonData['isAdmin'] != None and jsonData['isAdmin'] != "":
                employee.isAdmin=jsonData['isAdmin']
            if jsonData['isBoss'] != None and jsonData['isBoss'] != "":
                employee.isBoss=jsonData['isBoss']
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize()
        else: 
            return {"msg": "Not authorized"}, 401

    if request.method == 'DELETE':
        user_id = get_jwt_identity()
        employee = Employee.query.get_or_404(user_id)
        if employee.isAdmin:
            employee = Employee.query.filter_by(personID=pID).first_or_404()
            serializedEmployee = Employee.serialize(employee)
            db.session.delete(employee)
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize()
        else:
            return {"msg": "Not authorized"}, 401



