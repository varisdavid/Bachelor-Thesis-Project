from flask_sqlalchemy import SQLAlchemy
from flask import current_app as app
from server import app
from datetime import date, datetime

db = SQLAlchemy(app)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    companyOrgNumber = db.Column(db.String, db.ForeignKey('companies.orgNumber'), nullable=False)
    
    def __repr__(self):
        return '<Project {}: {} {}>'.format(self.id, self.name, self.companyOrgNumber)

    def serialize(self):
        return dict(id=self.id, name=self.name, companyOrgNumber=self.companyOrgNumber)


class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date)
    name = db.Column(db.String, nullable=False)
    startTime = db.Column(db.DateTime)
    stopTime = db.Column(db.DateTime)
    location = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey(
        'projects.id'), nullable=False)

    def __repr__(self):
        return '<Activity {} : {} {} {} {} {} {} {}>'.format(self.id, self.date, self.name, self.startTime, self.stopTime, self.location, self.description, self.project_id)

    def serialize(self):
        return dict(id=self.id, date=self.date, name=self.name, startTime=self.startTime.isoformat(),
                    stopTime=self.stopTime.isoformat(), location=self.location, description=self.description, project_id=self.project_id)
    
    def serializeForCalendar(self):
        return dict(id=self.id, start=self.startTime.isoformat(), end=self.stopTime.isoformat(), title=self.name)

class Employee(db.Model):
    __tablename__ = 'employees'
    personID = db.Column(db.String, primary_key=True)
    email = db.Column(db.String, nullable=True)
    name = db.Column(db.String, nullable=False)
    isAdmin = db.Column(db.Boolean, nullable=False)
    isBoss = db.Column(db.Boolean, nullable=False)
    passwordHash = db.Column(db.String, nullable=True)
    usingDefaultPassword = db.Column(db.Boolean, nullable=False)
    company = db.Column(db.String, db.ForeignKey('companies.orgNumber'), nullable=False)

    def __repr__(self):
        return '<Employee {}: {} {} {} {} {}>'.format(self.personID, self.email, self.name, self.isAdmin, self.isBoss, self.company)

    def serialize(self):
        return dict(personID=self.personID, email=self.email, name=self.name, isAdmin=self.isAdmin, isBoss=self.isBoss, company=self.company)


class Person_Activity(db.Model):
    __tablename__ = 'person_activities'
    personID = db.Column(db.String, db.ForeignKey(
        'employees.personID'), primary_key=True)
    id = db.Column(db.Integer, db.ForeignKey(
        'activities.id'), primary_key=True)

    def __repr__(self):
        return '<Person_Activity {} {}:>'.format(self.personID, self.id)

    def serialize(self):
        return dict(personID=self.personID, id=self.id)


class LoggedWork(db.Model):
    __tablename__ = 'logged_work'
    id = db.Column(db.Integer, primary_key=True)
    employeeID = db.Column(db.String, db.ForeignKey(
        'employees.personID'), nullable=False)
    projectID = db.Column(db.Integer, db.ForeignKey(
        'projects.id'), nullable=False)
    approved = db.Column(db.Boolean, default=True)
    startTime = db.Column(db.DateTime, nullable=False)
    endTime = db.Column(db.DateTime, nullable=False)
    comment = db.Column(db.String, nullable=True)
    petrolCost = db.Column(db.Integer, nullable=True)
    otherCost = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return '<LoggedWork {}: {} {} {} {} {} {} {} {}>'.format(self.id, self.employeeID, self.projectID, self.approved, self.startTime, self.endTime, self.comment, self.petrolCost, self.otherCost)

    def serialize(self):
        return dict(id=self.id, employeeID=self.employeeID, projectID=self.projectID, approved=self.approved, startTime=self.startTime, endTime=self.endTime, comment=self.comment, petrolCost=self.petrolCost, otherCost=self.otherCost)

class Company(db.Model):
    __tablename__ = 'companies'
    orgNumber = db.Column(db.String, primary_key = True)
    name = db.Column(db.String, nullable = False)

    def __repr__(self):
        return '<Company {}: {}>'.format(self.orgNumber, self.name)

    def serialize(self):
        return dict(id=self.orgNumber, name=self.name)
