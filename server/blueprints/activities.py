from flask import Blueprint, request, jsonify
from datetime import date as d
from flask_jwt_extended import jwt_required, get_jwt_identity


# You can import the database from a blueprint
from server.database import db, Activity, Person_Activity

# Creates the blueprint
bp = Blueprint('activities', __name__, url_prefix='/activity')


@bp.route("/add", methods=['POST'])
# Dates should be send in iso formating, YYYY-MM-DD.
# Example:
# localhost/activity/2020-01-04
@bp.route("/<date>", methods=['GET'])
def getActivitiesOnDate(date):
    try:
        convertedDate = d.fromisoformat(date)
    except:
        return {"msg": "wrong formated date"}, 400
    activities = db.session.query(Activity).filter(
        Activity.date == convertedDate).all()

    serialized_activities = [activity.serializeForCalendar()
                             for activity in activities]
    return jsonify(serialized_activities), 200

# returns the activities of the current user formatted in fullcalender event parsable json.
# i.e. the return values from this route can be passed directly into the fullcalendar events field
# 
# TODO: Should return a subset of all activities. For example only upcoming activities
@bp.route("/current_user", methods=['GET'])
@jwt_required
def getUserActivities():
    user_id = get_jwt_identity()
    activities = db.session.query(Activity).\
        join(Person_Activity).\
        filter(Activity.id == Person_Activity.id).\
        filter(Person_Activity.personID == user_id).\
        all()
    
    return jsonify([activity.serializeForCalendar() for activity in activities]), 200
