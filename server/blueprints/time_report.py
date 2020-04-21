from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from datetime import datetime
import calendar

#You can import the database from a blueprint
from server.database import db, Employee, LoggedWork
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
    print(user.isAdmin)
    if request.method == 'GET':
        if user.isAdmin:
            print("hola")
            return jsonify(loggedWork.serialize())
        if user.personID == loggedWork.employeeID:
            print("tjena")
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

@bp.route('/employee/<employeeID>', methods=['GET'])
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

@bp.route('/time', methods=['GET'])
@jwt_required
def getWorkerLoggedTime():
    user = get_jwt_identity()
    time = []
    works = LoggedWork.query.all()
    first_month_time = 0
    second_month_time = 0
    third_month_time = 0
    fourth_month_time = 0
    fivth_month_time = 0
    this_month_time = 0
    for i in works:
        if datetime.today().month > 5:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5 and i.startTime.year == datetime.today().year:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4 and i.startTime.year == datetime.today().year:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 5:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4 and i.startTime.year == datetime.today().year:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 4:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 3:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 2:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2+12 and i.startTime.year == datetime.today().year-1:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 1:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2+12 and i.startTime.year == datetime.today().year-1:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1+12 and i.startTime.year == datetime.today().year-1:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
    time.append(first_month_time)
    time.append(second_month_time)
    time.append(third_month_time)
    time.append(fourth_month_time)
    time.append(fivth_month_time)
    time.append(this_month_time)
    return jsonify(time)


@bp.route('/time/<employeeID>', methods=['GET'])
@jwt_required
def getLoggedTime(employeeID):
    user = employeeID
    time = []
    works = LoggedWork.query.all()
    first_month_time = 0
    second_month_time = 0
    third_month_time = 0
    fourth_month_time = 0
    fivth_month_time = 0
    this_month_time = 0
    for i in works:
        if datetime.today().month > 5:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5 and i.startTime.year == datetime.today().year:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4 and i.startTime.year == datetime.today().year:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 5:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4 and i.startTime.year == datetime.today().year:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 4:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3 and i.startTime.year == datetime.today().year:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 3:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2 and i.startTime.year == datetime.today().year:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 2:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2+12 and i.startTime.year == datetime.today().year-1:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1 and i.startTime.year == datetime.today().year:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
        if datetime.today().month == 1:
            if user == i.employeeID and i.startTime.month == datetime.today().month -5+12 and i.startTime.year == datetime.today().year-1:
                first_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -4+12 and i.startTime.year == datetime.today().year-1:
                second_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -3+12 and i.startTime.year == datetime.today().year-1:
                third_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -2+12 and i.startTime.year == datetime.today().year-1:
                fourth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month -1+12 and i.startTime.year == datetime.today().year-1:
                fivth_month_time = first_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
            if user == i.employeeID and i.startTime.month == datetime.today().month and i.startTime.year == datetime.today().year:
                this_month_time = this_month_time + divmod((i.endTime-i.startTime).total_seconds(), 3600)[0]
    time.append(first_month_time)
    time.append(second_month_time)
    time.append(third_month_time)
    time.append(fourth_month_time)
    time.append(fivth_month_time)
    time.append(this_month_time)
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
