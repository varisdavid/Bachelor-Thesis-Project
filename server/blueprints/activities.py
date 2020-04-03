from flask import Blueprint, request, jsonify
from datetime import date as d
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


# You can import the database from a blueprint
from server.database import db, Activity, Person_Activity, Project, Employee

# Creates the blueprint
bp = Blueprint('activities', __name__, url_prefix='/activity')

# Adds an activity to the database. Checks whether the project and the adder exists within the same company to prevent employees from changing other companies databases.
# The request must contain the following fields: data, name, startTire, stopTime, location, description and project_id
@bp.route("/add", methods=['POST'])
@jwt_required
def addActivity():
    jsonData = request.get_json()
    if (('date' not in jsonData) or ('name' not in jsonData) or ('startTime' not in jsonData) or
        ('stopTime' not in jsonData) or ('location' not in jsonData) or
            ('description' not in jsonData) or ('project_id' not in jsonData)):
        return {"msg": "Wrong fields"}, 400
    elif Project.query.get(jsonData["project_id"]).companyOrgNumber != Employee.query.get(get_jwt_identity()).company:
        return {"msg" : "Wrong project id"}, 401
    else:
        newActivity = Activity(date=d.fromisoformat(jsonData['date']), name=jsonData['name'], startTime=datetime.fromisoformat(jsonData['startTime']),
                               stopTime=datetime.fromisoformat(jsonData['stopTime']), location=jsonData['location'],
                               description=jsonData['description'], project_id=jsonData['project_id'])
        db.session.add(newActivity)
        db.session.commit()
        return newActivity.serialize()


# Returns the activities in the given timeframe. Only the users activities are returned.
# The url format for accessing this is: localhost:5000/feed?start=TIME-IN-ISO-FORMAT&end=TIME-IN-ISO-FORMAT
# An example url would look like: localhost:5000/feed?start=2020-03-29T00:00:00+01:00&end=2020-04-05T00:00:00+02:00
# TODO: Implement some safety checks if necessary. Not sure.
@bp.route("/feed")
@jwt_required
def activityFeed():
    start = request.args.get("start")
    end = request.args.get("end")
    user_id = get_jwt_identity()

    activities = db.session.query(Activity).\
        join(Person_Activity, Person_Activity.id == Activity.id).\
        filter(Person_Activity.personID == user_id).\
        filter(Activity.startTime >= start).\
        filter(Activity.startTime <= end).\
        all()

    return jsonify([activity.serializeForCalendar() for activity in activities]), 200
