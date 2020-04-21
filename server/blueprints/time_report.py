from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

#You can import the database from a blueprint
from server.database import db, Employee, LoggedWork, Project
from server import app

jwt = JWTManager(app)

#Creates the blueprint
bp = Blueprint('time-report', __name__, url_prefix='/time-report')

#Adds a time-report
#Needs employeeID, projectID, startTime, EndTime, 
@bp.route('/report_time', methods=['POST'])
@jwt_required
def report_time():
    user = Employee.query.get(get_jwt_identity())
    if request.method == 'POST':
        time_report_data = request.get_json()
        if 'comments' not in time_report_data:
            new_time_report = LoggedWork(employeeID = user.personID, projectID = time_report_data['projectID'], startTime = time_report_data['startTime'], endTime = time_report_data['endTime'])
        else:
            new_time_report = LoggedWork(employeeID = user.personID, projectID = time_report_data['projectID'], startTime = time_report_data['startTime'], endTime = time_report_data['endTime'], comment = time_report_data['comments'])
        db.session.add(new_time_report)
        db.session.commit()
        response = Response(200)
        return "hej"

@bp.route('/<string:pID>', methods=['GET'])
@jwt_required
def get_time():
    employee = Employee.query.filter_by(personID=pID)
    if request.method == 'GET':
        totTime=0
        serializedLoggedWorkList = [work.serialize() for work in LoggedWork.query.all()]
        for work in serializedLoggedWorkList:
            if work.employeeID==employee.personID:
                totTime = totTime + (work.endTime-work.startTime)
        print(totTime)
        return totTime, 200
        
# Returns all logged work on a specific project
@bp.route('/report_time/projects/<int:project_id>', methods=['GET'])
#@jwt_required
def time_report(project_id):
    #user = Employee.query.get(get_jwt_identity())
    loggedworkList = LoggedWork.query.all()
    projectName = Project.query.get(project_id).name
    filteredLoggedWorkList = []
    for i in range(len(loggedworkList)):
        if loggedworkList[i].projectID == projectName:
            loggedworkList[i] = LoggedWork.serialize(loggedworkList[i])
            filteredLoggedWorkList.append(loggedworkList[i])
    return jsonify(filteredLoggedWorkList)
