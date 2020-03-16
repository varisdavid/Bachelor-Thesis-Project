from flask import Blueprint

bp = Blueprint('authentication', __name__, url_prefix='/auth')

@bp.route("/hello")
def hello():
    return "sadfasdfklömasdlf"