from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config


db = SQLAlchemy()


def create_app():
	app = Flask(__name__)
	app.config.from_object(Config)
	app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'

	Config.init_app(app)
	db.init_app(app)

	from .main import social_manager as sm
	app.register_blueprint(sm)

	return app
