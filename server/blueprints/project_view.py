from flask import Blueprint, request, jsonify, Response, abort
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from server.database import db, Project, Employee
from server import app


app.config['JWT_SECRET_KEY'] = "GwzrtfCta1xDHgwfBVo0"
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

#Blueprint
bp = Blueprint('project_view', __name__, url_prefix='/project_view')

#Handles methods for projects in database
@bp.route('/projects', methods=['GET','POST'])
@jwt_required
def projectview():
    user = Employee.query.get_or_404(get_jwt_identity())
    projectList = Project.query.all()
    if request.method == 'GET':
        filteredProjectList = []
        for i in range(len(projectList)):
            if user.company == projectList[i].companyOrgNumber:
                projectList[i] = Project.serialize(projectList[i])
                filteredProjectList.append(projectList[i])
        return jsonify(filteredProjectList)
    elif request.method == 'POST':
        if not user.isAdmin:
            return {"msg": "Not authorized"}, 401
        body = request.get_json()
        projectName = body['name']
        newProject = Project(name=projectName, companyOrgNumber=user.company)
        db.session.add(newProject)
        db.session.commit()
        newProjectJson = Project.serialize(newProject)
        return jsonify(newProjectJson)

#Handles methods for a specific project in database
@bp.route('/projects/<int:project_id>', methods=['GET','PUT','DELETE'])
@jwt_required
def projectIndex(project_id):
    user = Employee.query.get_or_404(get_jwt_identity())
    if request.method == "GET":
        project = Project.query.filter_by(id=project_id).first_or_404()
        project = Project.serialize(project)
        return jsonify(project)
    elif request.method == 'PUT':
        if not user.isAdmin:
            return {"msg": "Not authorized"}, 401
        body = request.get_json()
        project = Project.query.filter_by(id=project_id).first_or_404()
        if body['name'] != None or body['name'] != "":
            setattr(project, 'name', body['name'])
        if body['companyOrgNumber'] != None or body['companyOrgNumber'] != "":
            setattr(project, 'companyOrgNumber', body['companyOrgNumber'])
        db.session.commit()
        project = Project.serialize(project)
        return jsonify(project)
    elif request.method == 'DELETE':
        if not user.isAdmin:
            return {"msg": "Not authorized"}, 401
        project = Project.query.filter_by(id=project_id).first_or_404()
        db.session.delete(project)
        db.session.commit()
        return "200 (Success)"