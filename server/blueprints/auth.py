from flask import Blueprint

#Creates the blueprint
bp = Blueprint('authentication', __name__, url_prefix='/auth')

#Defines a route that can be accessed through localhost:5000/auth/ping
@bp.route("/ping")
def hello():
    return "ok"