from flask_sqlalchemy import SQLAlchemy

from main import app

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite://database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATION'] = False

db = SQLAlchemy(app)