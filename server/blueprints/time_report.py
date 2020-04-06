from flask import Blueprint, request, jsonify, Response
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity

#You can import the database from a blueprint
from server.database import db, Employee, LoggedWork
from server import app

#Creates the blueprint
bp = Blueprint('time-report', __name__, url_prefix='/time-report')

#Adds a time-report
#Needs employeeID, projectID, startTime, EndTime, 
@bp.route('/report_time', methods=['POST'])
#@jwt_required
def report_time():
    #employee = get_jwt_identity()
    if request.method == 'POST':
        time_report_data = request.get_json()
        print(time_report_data)
        new_time_report = LoggedWork(employeeID = "980221", projectID = time_report_data['projectID'], startTime = time_report_data['startTime'], endTime = time_report_data['endTime'])
        db.session.add(new_time_report)
        db.session.commit()
        response = Response(200)
        return "hej"