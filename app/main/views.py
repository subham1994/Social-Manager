import os, datetime
from flask import render_template, request, jsonify, url_for
from werkzeug.utils import secure_filename

from . import social_manager
from .. import db
from ..models import User, Page, Activity


BASE_DIR = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))


def is_file_valid(file):
	return '.' in file.filename and file.filename.rsplit('.', 1)[1] in set(['png', 'jpg', 'jpeg', 'gif'])


@social_manager.route('/', methods=['GET', 'POST'])
def login():
	if request.method == 'POST' and request.json:
		user = User.query.get(request.json.get('profile').get('id'))
		try:
			if not user:
				user_data = request.json.get('profile')
				user = User(
					id=user_data.get('id'),
					first_name=user_data.get('first_name'),
					last_name=user_data.get('last_name'),
					photo=user_data.get('picture').get('data').get('url')
				)
				db.session.add(user)
				pages_data = request.json.get('pages').get('data')
				for page_data in pages_data:
					page = Page(
						id=page_data.get('id'),
						name=page_data.get('name'),
						photo=page_data.get('picture').get('data').get('url'),
						user_id=user.id,
						category=page_data.get('category'),
						description=page_data.get('description')
					)
					db.session.add(page)
				db.session.commit()
				return jsonify({'status': 200})
		except Exception as e:
			print(e)
		else:
			return jsonify({'status': 500})
	return render_template('login.html')


@social_manager.route('/pages/<user_id>')
def pages(user_id):
	user = User.query.get(user_id)
	return render_template('pages.html', user=user)


@social_manager.route('/upload', methods=['POST'])
def upload():
	if request.method == "POST" and 'file' in request.files:
		file = request.files.get('file')
		if file and is_file_valid(file):
			filename = secure_filename(file.filename)
			file.save(BASE_DIR + '/static/uploads/' + filename)
			return jsonify({
				'status': 200,
				'path': url_for('static', filename='uploads/' + filename),
				'filename': filename
			})
		return jsonify({'status': 500, 'msg': 'File is not an image file'})
	return jsonify({'status': 500, 'msg': 'Please post an image file'})


@social_manager.route('/update-activity', methods=['POST'])
def update_activity():
	if request.method == 'POST' and request.json:
		try:
			activity = Activity(
				page_name=request.json.get('page'),
				filename=request.json.get('file'),
				created_at=datetime.datetime.timestamp(datetime.datetime.now()),
				size=request.json.get('size')
			)
			db.session.add(activity)
			db.session.commit()
			return jsonify({'status': 200, 'msg': 'Updated activities list'})
		except Exception as e:
			return jsonify({'status': 500, 'msg': 'Could not update activity list, please try again', 'err': e})
	return jsonify({'status': 500, 'msg': 'No activity to update'})
