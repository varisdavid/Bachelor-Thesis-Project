from flask import Blueprint, request, jsonify
from datetime import date as d

#You can import the database from a blueprint
from server.database import db, Activity

#Creates the blueprint
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
    activities = db.session.query(Activity).filter(Activity.date == convertedDate).all()
    
    serialized_activities = [activity.serialize() for activity in activities]
    return jsonify(serialized_activities), 200