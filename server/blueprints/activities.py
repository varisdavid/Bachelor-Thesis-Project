from flask import Blueprint, request, jsonify
from datetime import date as d
from datetime import datetime
from flask_jwt_extended import jwt_required, get_jwt_identity


# You can import the database from a blueprint
from server.database import db, Activity, Person_Activity, Project, Employee

# Creates the blueprint
bp = Blueprint('activities', __name__, url_prefix='/activity')

# Adds an activity to the database. Checks whether the project and the adder exists within the same company to prevent employees from changing other companies databases.
# The request must contain the following fields: date, name, startTire, stopTime, location, description and project_id
# If the field "employees" (should be of type: list of integers) is included all employees in that list are added to the activity. Else the activity is created for the current user.

#TODO: Implement controls for Projects and Employee before using them.
@bp.route("/add", methods=['POST'])
@jwt_required
def addActivity():
    jsonData = request.get_json()
    if (('date' not in jsonData) or ('name' not in jsonData) or ('startTime' not in jsonData) or
        ('stopTime' not in jsonData) or ('location' not in jsonData) or
            ('description' not in jsonData) or ('project_id' not in jsonData)):
        return {"msg": "Wrong fields"}, 400
    elif Project.query.get(jsonData["project_id"]).companyOrgNumber != Employee.query.get(get_jwt_identity()).company:
        return {"msg": "Wrong project id"}, 401
    else:
        newActivity = Activity(date=d.fromisoformat(jsonData['date']), name=jsonData['name'], startTime=datetime.fromisoformat(jsonData['startTime']),
                               stopTime=datetime.fromisoformat(jsonData['stopTime']), location=jsonData['location'],
                               description=jsonData['description'], project_id=jsonData['project_id'])
        db.session.add(newActivity)
        db.session.commit()

        if 'employees' in jsonData:
            for employee in jsonData['employees']:
                db.session.add(Person_Activity(personID = employee, id = newActivity.id))
        else:
            user = get_jwt_identity()
            db.session.add(Person_Activity(personID = user, id = newActivity.id))
        db.session.commit()

        return newActivity.serialize()

@bp.route("/<activityID>", methods=["GET", "PUT", "DELETE"])
@jwt_required
def act(activityID):
    user_id = get_jwt_identity()
    if request.method == "GET":
        activity = Activity.query.get_or_404(activityID)
        if Project.query.get(activity.project_id).companyOrgNumber == Employee.query.get(user_id).company:
            activityDict = activity.serialize()
            activityDict["project"] = Project.query.get(activity.project_id).serialize()
            activityDict["employees"] = []
            for p_a in Person_Activity.query.filter_by(id = activity.id).all():
                activityDict["employees"].append(Employee.query.get(p_a.personID).serialize())
            
            return jsonify(activityDict)
        else:
            return {"msg" : "not authorized"}, 401
    elif request.method == "PUT":
        activity = Activity.query.get_or_404(activityID)
        jsonData = request.get_json()
        for key in request.get_json():
            # TODO: Filtrera bort alla attribut som inte ska gå att ändra.
            if(hasattr(activity, key) and (key != "id")):
                if key == "startTime" or key == "stopTime":
                    setattr(activity, key, datetime.fromisoformat(jsonData[key]))
                    print("I specialfallet")
                elif key == "date":
                    setattr(activity, key, d.fromisoformat(jsonData[key]))
                else:
                    setattr(activity, key, jsonData[key])
        
        for p_a in Person_Activity.query.filter_by(id = activityID):
            db.session.delete(p_a)

        for employee in jsonData['employees']:
            db.session.add(Person_Activity(personID = employee, id = activityID))

        db.session.commit()
        return jsonify(Activity.query.get(activityID).serialize())
    elif request.method == "DELETE":
        emp = Employee.query.get(user_id)
        companyOrgNumber = db.session.query(Project).join(Activity).filter(Activity.project_id == Project.id).filter(Project.companyOrgNumber == emp.company).filter(Activity.id == id).first().companyOrgNumber
        if (emp.isAdmin or emp.isBoss) and (emp.company == companyOrgNumber):
            act = Activity.query.get(activityID)
            serializedActivity = act.serialize()
            for pa in Person_Activity.query.filter_by(id=act.id).all():
                db.session.delete(pa)
            db.session.delete(act)
            db.session.commit()
            return jsonify(serializedActivity)


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
    if(request.get_json() is not None):
        if("employeeID" in request.get_json()):
            emp = Employee.query.get(user_id)
            if(emp.isAdmin or emp.isBoss):
                user_id=request.get_json()["employeeID"]
            else:
                return {"msg": "not authorized"}, 401

    activities = db.session.query(Activity).\
        join(Person_Activity, Person_Activity.id == Activity.id).\
        filter(Person_Activity.personID == user_id).\
        filter(Activity.startTime >= start).\
        filter(Activity.startTime <= end).\
        all()

    return jsonify([activity.serializeForCalendar() for activity in activities]), 200

@bp.route("/<id>/feed")
@jwt_required
def activityFeedID(id):
    start = request.args.get("start")
    end = request.args.get("end")
    user_id = get_jwt_identity()
    emp = Employee.query.get(user_id)
    if(not(emp.isAdmin or emp.isBoss)):
        return {"msg": "not authorized"}, 401
    else:
        activities = db.session.query(Activity).\
            join(Person_Activity, Person_Activity.id == Activity.id).\
            filter(Person_Activity.personID == id).\
            filter(Activity.startTime >= start).\
            filter(Activity.startTime <= end).\
            all()

        return jsonify([activity.serializeForCalendar() for activity in activities]), 200