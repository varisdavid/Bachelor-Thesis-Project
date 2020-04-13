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
    print(user_id)
    employee = Employee.query.get_or_404(user_id)
    print(employee)
    print(employee.company)
    if request.method == 'GET':
        print("==GET==")
        serializedEmployeeList = [emp.serialize() for emp in Employee.query.all()]
        return jsonify(serializedEmployeeList)
    if request.method == 'POST':
        print("==POST==")
        if employee.isAdmin:
            print("IS ADMIN")
            jsonData = request.get_json()
            db.session.add(Employee(personID=jsonData['personID'], email=jsonData['email'], name=jsonData['name'],
                                    isAdmin=False, isBoss=False, company=employee.company, passwordHash = bcrypt.generate_password_hash("halla").decode('utf-8'), usingDefaultPassword=True))
            db.session.commit()
            return Employee.query.get_or_404(jsonData['personID']).serialize(), 200
        else:
            print("NOT ADMIN")
            return {"msg": "Not authorized"}, 401

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



