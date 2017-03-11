from . import db


class Activity(db.Model):
	__tablename__ = 'activities'
	id = db.Column(db.Integer, primary_key=True)
	page_name = db.Column(db.String(64))
	filename = db.Column(db.String(64))
	created_at = db.Column(db.Float)
	size = db.Column(db.Integer)
	user_id = db.Column(db.String(64))

	def __repr__(self):
		return self.page_name + ' ' + self.filename
