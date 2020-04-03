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


# Returns the activities in the given timeframe. Only the users activities are returned.
# The url format for accessing this is: localhost:5000/feed?start=TIME-IN-ISO-FORMAT&end=TIME-IN-ISO-FORMAT
# An example url would look like: localhost:5000/feed?start=2020-03-29T00:00:00+01:00&end=2020-04-05T00:00:00+02:00
#TODO: Implement some safety checks if necessary. Not sure.
@bp.route("/feed")
@jwt_required
def activityFeed():
    start = request.args.get("start")
    end = request.args.get("end")
    user_id = get_jwt_identity()

    activities = db.session.query(Activity).\
        join(Person_Activity).\
        filter(Activity.id == Person_Activity.id).\
        filter(Person_Activity.personID == user_id).\
        filter(Activity.startTime >= start).\
        filter(Activity.startTime <= end).\
        all()

    return jsonify([activity.serializeForCalendar() for activity in activities]), 200