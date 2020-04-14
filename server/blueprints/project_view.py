from flask import Blueprint, request, jsonify, Response, abort
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from server.database import db, Project
from server import app

jwt = JWTManager(app)

#Blueprint
bp = Blueprint('project_view', __name__, url_prefix='/project_view')

#Handles methods for projects in database
@bp.route('/projects', methods=['GET','POST'])
def projectview():
    projectList = Project.query.all()
    if request.method == 'GET':
        for i in range(len(projectList)):
            projectList[i] = Project.serialize(projectList[i])
        return jsonify(projectList)
    elif request.method == 'POST':
        body = request.get_json()
        projectName = body['name']
        companyOrgNumber = body['companyOrgNumber']
        newProject = Project(name=projectName, companyOrgNumber=companyOrgNumber)
        db.session.add(newProject)
        db.session.commit()
        newProjectJson = Project.serialize(newProject)
        return jsonify(newProjectJson)

#Handles methods for a specific project in database
@bp.route('/projects/<int:project_id>', methods=['GET','PUT','DELETE'])
def projectIndex(project_id):
    if request.method == "GET":
        project = Project.query.filter_by(id=project_id).first_or_404()
        project = Project.serialize(project)
        return jsonify(project)
    elif request.method == 'PUT':
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
        project = Project.query.filter_by(id=project_id).first_or_404()
        db.session.delete(project)
        db.session.commit()
        return "200 (Success)"