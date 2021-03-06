from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__, static_folder='../client', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from server.database import db, Employee, Project, LoggedWork, Company
from server.blueprints import auth, time_report, employee, schedule, time_report, project_view


#imports the blueprint from package blueprints
from server.blueprints import auth, time_report, activities

#Adds all the defined routes in blueprints
app.register_blueprint(auth.bp)
app.register_blueprint(employee.bp)
app.register_blueprint(time_report.bp)
app.register_blueprint(activities.bp)
app.register_blueprint(project_view.bp)
app.register_blueprint(employee.bp)

@app.route("/")
def client():
    return app.send_static_file("client.html")

