from flask import Blueprint

social_manager = Blueprint('social_manager', __name__)

from . import views, errors
