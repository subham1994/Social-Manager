from . import db


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


class User(db.Model):
	__tablename__ = 'users'
	id = db.Column(db.String(64), primary_key=True)
	first_name = db.Column(db.String(64))
	last_name = db.Column(db.String(64))
	photo = db.Column(db.Text)
	pages = db.relationship('Page', backref='user')

	def __repr__(self):
		return self.first_name + ' ' + self.last_name
