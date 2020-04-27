from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from datetime import datetime, timedelta
import calendar
from sqlalchemy.sql import func
from sqlalchemy import extract

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
        startTime = datetime.fromisoformat(time_report_data['startTime'])
        endTime = datetime.fromisoformat(time_report_data['endTime'])
        if 'comments' not in time_report_data:
            new_time_report = LoggedWork(employeeID = user.personID, projectID = time_report_data['projectID'], startTime = startTime, endTime = endTime)
        else:
            new_time_report = LoggedWork(employeeID = user.personID, projectID = time_report_data['projectID'], startTime = startTime, endTime = endTime, comment = time_report_data['comments'])
        db.session.add(new_time_report)
        db.session.commit()
        response = Response(200)
        return "hej"

@bp.route('/<loggedWorkID>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required
def editLoggedWork(loggedWorkID):
    users = []
    user = Employee.query.get(get_jwt_identity())
    users.append(user.serialize())
    loggedWork = LoggedWork.query.get(loggedWorkID)
    employee = Employee.query.get(loggedWork.employeeID)
    users.append(employee.serialize())
    if request.method == 'GET':
        if user.isAdmin:
            loggedWork.startTime= loggedWork.startTime - timedelta(hours = 1) 
            loggedWork.endTime= loggedWork.endTime - timedelta(hours = 1) 
            return jsonify(loggedWork.serialize())
        if user.personID == loggedWork.employeeID:
            loggedWork.startTime= loggedWork.startTime - timedelta(hours = 1) 
            loggedWork.endTime= loggedWork.endTime - timedelta(hours = 1) 
            return jsonify(loggedWork.serialize())
    if request.method == 'PUT' and user.personID == loggedWork.employeeID or request.method == 'PUT' and user.isAdmin:
        loggedWork_data = request.get_json()
        startTime = datetime.fromisoformat(loggedWork_data['startTime'])
        endTime = datetime.fromisoformat(loggedWork_data['endTime'])
        if 'projectID' in loggedWork_data:
            setattr(loggedWork, 'projectID', loggedWork_data['projectID'])
        if 'startTime' in loggedWork_data:
            setattr(loggedWork, 'startTime', startTime)
        if 'endTime' in loggedWork_data:
            setattr(loggedWork, 'endTime', endTime)
        if 'comments' in loggedWork_data:
            setattr(loggedWork, 'comment', loggedWork_data['comments'])
        db.session.commit() 
        return jsonify(users)  
    if request.method == 'DELETE' and user.personID == loggedWork.employeeID or request.method == 'DELETE' and user.isAdmin:
        db.session.delete(loggedWork)
        db.session.commit()
        return jsonify(users)


@bp.route('/myWork', methods=['GET'])
@jwt_required
def getMyLoggedWork():
    works = LoggedWork.query.all()
    user = get_jwt_identity()
    loggedWorks = []
    time = 0
    for i in works:
        if i.employeeID == user:
            loggedWorks.append(i.serialize())
            time = divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
    return jsonify(loggedWorks)

@bp.route('/employee/<string:employeeID>', methods=['GET'])
@jwt_required
def getEmployeeLoggedWorks(employeeID):
    works = LoggedWork.query.all()
    loggedWorks = []
    for i in works:
        if i.employeeID == employeeID:
            loggedWorks.append(i.serialize())
    return jsonify(loggedWorks)

@bp.route('/getWorkedTime/<loggedWorkID>', methods=['GET'])
@jwt_required
def getWorkedTime(loggedWorkID):
    loggedwork = LoggedWork.query.get(loggedWorkID)
    time = divmod((loggedwork.endTime-loggedwork.startTime).total_seconds(), 3600)[0]
    print(time)
    return jsonify(time)
    
@bp.route('/totalTime/<string:pID>', methods=['GET'])
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
    
    filteredLoggedWorkList = []
    for i in range(len(loggedworkList)):
        if loggedworkList[i].projectID == project_id:
            loggedworkList[i] = LoggedWork.serialize(loggedworkList[i])
            filteredLoggedWorkList.append(loggedworkList[i])
    return jsonify(filteredLoggedWorkList)

@bp.route('/time', methods=['GET'])
@jwt_required
def getWorkerLoggedTime():
    user = get_jwt_identity()
    time = getEmployeeLoggedTime(user)
    return time

@bp.route('/time/<string:employeeID>', methods=['GET'])
@jwt_required
def getLoggedTime(employeeID):
    time = getEmployeeLoggedTime(employeeID)
    return time

def getEmployeeLoggedTime(employeeID):
    time = []
    this_month = datetime.today().month
    this_year = datetime.today().year
    for i in range(6):
        month = this_month - i
        if month<1:
            newMonth = month + 12
            newYear = this_year - 1
            workedTime = getWorkedTimeInMonth(employeeID, newMonth, newYear)
        else:
            workedTime = getWorkedTimeInMonth(employeeID, month, this_year)
        time.append(workedTime)
    return jsonify(time)


def getWorkedTimeInMonth(employee, month, year):
    works = LoggedWork.query.filter(extract('month', LoggedWork.startTime) == month).filter(extract('year', LoggedWork.startTime) == year).filter(LoggedWork.employeeID.like(employee)).all()
    time = 0
    for work in works:
        time = time + divmod((work.endTime-work.startTime).total_seconds(), 3600)[0]
    return time
