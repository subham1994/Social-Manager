import os
basedir = os.path.abspath(os.path.dirname(__file__))


class Config:
	DEBUG = True
	SQLALCHEMY_COMMIT_ON_TEARDOWN = True
	MAX_CONTENT_LENGTH = 1024 * 1024
	SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, 'data.sqlite')

	@staticmethod
	def init_app(app):
		pass
