from flask import Blueprint, request, jsonify, Response
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity

# You can import the database from a blueprint
from server.database import db, Employee, Company
from server import app

# random string
app.config['JWT_SECRET_KEY'] = "GwzrtfCta1xDHgwfBVo0"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Creates the blueprint
bp = Blueprint('authentication', __name__, url_prefix='/auth')

# TODO: Should probably be moved to a better location, for example a blueprint for management the companies.
# TODO: Currently sets the default password to "halla". Should be changed to either a random string, or a string supplied by the person who signs up the company.

# Signs in a user.
# Required json fields: personID and password.
@bp.route("/sign-in", methods=['POST'])
def signIn():
    jsonData = request.get_json()
    if ('personID' not in jsonData) or ('password' not in jsonData):
        return {"msg": "Wrong fields"}, 400
    else:
        emp = Employee.query.get_or_404(jsonData['personID'])
        if bcrypt.check_password_hash(emp.passwordHash, jsonData['password']):
            token = create_access_token(emp.personID)
            return {"access_token": token, "person_id": jsonData["personID"]}, 200
        else:
            return {"msg": "Wrong PID or password"}, 401

# Changes the password of the current user.
# Required json fields: currentPassword and newPassword.
@bp.route("/change-password", methods=['PUT'])
@jwt_required
def changePassword():
    jsonData = request.get_json()
    if('currentPassword' not in jsonData or 'newPassword' not in jsonData):
        return {'msg' : 'wrong fields'}, 400
    else:
        user = Employee.query.get(get_jwt_identity())
        if(bcrypt.check_password_hash(user.passwordHash, jsonData['currentPassword'])):
            user.passwordHash = bcrypt.generate_password_hash(jsonData['newPassword']).decode('utf-8')
            user.usingDefaultPassword = False
            db.session.commit()
            return {'msg' : 'password changed'}, 200
        else:
            return {'msg' : 'wrong password'}, 401

# Checks if the user is still using their default assigned password.
@bp.route("/default-password")
@jwt_required
def defaultPassword(): 
    return {'usingDefaultPassword':Employee.query.get(get_jwt_identity()).usingDefaultPassword}
        
# Adds a company to the database.
# Required json fields: companyName, companyOrgNumber, adminName, adminPid, adminEmail, adminPassword.
@bp.route("/sign-up-company", methods=['POST'])
def signUpCompany():
    jsonData = request.get_json()
    if (('companyName' not in jsonData) or ("companyOrgNumber" not in jsonData) or ('adminName' not in jsonData) or ('adminPid' not in jsonData) or ('adminEmail' not in jsonData) or ('adminPassword' not in jsonData)):
        return {"msg": "Wrong fields"}, 400
    else:
        newCompany = Company(
            orgNumber=jsonData["companyOrgNumber"], name=jsonData["companyName"])
        db.session.add(newCompany)

        admPasswordHash = bcrypt.generate_password_hash(
            jsonData["adminPassword"]).decode("utf-8")
        adm = Employee(personID=jsonData["adminPid"], email=jsonData["adminEmail"], name=jsonData["adminName"],
                       isAdmin=True, isBoss=False, passwordHash=admPasswordHash, company=jsonData["companyOrgNumber"], usingDefaultPassword=False)
        db.session.add(adm)
        db.session.commit()
        return Company.query.get(jsonData["companyOrgNumber"]).serialize()


