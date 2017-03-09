from . import db, login_manager
from flask_login import UserMixin


class Page(db.Model):
	__tablename__ = 'pages'
	id = db.Column(db.String(64), primary_key=True)
	name = db.Column(db.String(64))
	description = db.Column(db.Text)
	category = db.Column(db.String(64))
	photo = db.Column(db.Text)
	user_id = db.Column(db.String(64), db.ForeignKey('users.id'))

	def __repr__(self):
		return self.name


class User(db.Model, UserMixin):
	__tablename__ = 'users'
	id = db.Column(db.String(64), primary_key=True)
	first_name = db.Column(db.String(64))
	last_name = db.Column(db.String(64))
	photo = db.Column(db.Text)
	pages = db.relationship('Page', backref='user')

	def __repr__(self):
		return self.first_name + ' ' + self.last_name


@login_manager.user_loader
def load_user(user_id):
    """
    callback function to load user object, given an email as unicode string.

    :param user_id: facebook id of the user
    :type user_id: str
    :return: User object, if found, else None.
    """
    return User.query.get(user_id)
