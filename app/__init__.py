from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_login import LoginManager


db = SQLAlchemy()
login_manager = LoginManager()
login_manager.session_protection = 'basic'
login_manager.login_view = 'social_manager.login'


def create_app():
	app = Flask(__name__)
	app.config.from_object(Config)
	app.secret_key = 'F12Zr47j\3yX R~X@H!jmM]Lwf/,?KT'

	Config.init_app(app)
	db.init_app(app)
	login_manager.init_app(app)

	from .main import social_manager as sm
	app.register_blueprint(sm)

	return app
