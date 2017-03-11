import datetime
import os
from collections import defaultdict

from flask import render_template, request, jsonify, url_for, redirect
from werkzeug.utils import secure_filename

from . import social_manager
from .. import db
from ..models import Activity

BASE_DIR = os.path.dirname(os.path.abspath(os.path.dirname(__file__)))
cache = defaultdict(dict)


def is_authenticated(user_id):
	return user_id in cache and 'logged_in' in cache[user_id] and cache[user_id]['logged_in']


def is_file_valid(file):
	return '.' in file.filename and file.filename.rsplit('.', 1)[1] in {'png', 'jpg', 'jpeg', 'gif'}


def get_user(req):
	user_data = req.json.get('profile')
	user = dict(
		id=user_data.get('id'),
		first_name=user_data.get('first_name'),
		last_name=user_data.get('last_name'),
		photo=user_data.get('picture').get('data').get('url')
	)
	return user


def update_pages(req):
	pages_data = req.json.get('pages').get('data')
	cached_pages = []
	for page_data in pages_data:
		page = dict(
			id=page_data.get('id'),
			name=page_data.get('name'),
			photo=page_data.get('picture').get('data').get('url'),
			category=page_data.get('category'),
			description=page_data.get('description')
		)
		cached_pages.append(page)
	return cached_pages


@social_manager.route('/', methods=['GET', 'POST'])
def login():
	if request.method == 'POST' and request.json:
		user = get_user(request)
		cached_page_list = update_pages(request)  # update the page list in case of new pages
		cache[user['id']]['profile'] = user
		cache[user['id']]['pages'] = cached_page_list
		cache[user['id']]['logged_in'] = True
		return jsonify({'status': 200})
	return render_template('login.html')


@social_manager.route('/user/<user_id>')
def pages(user_id):
	if is_authenticated(user_id):
		user_data = cache[user_id]
		return render_template('pages.html', user=user_data['profile'], pages=user_data['pages'])
	return redirect(url_for('social_manager.login'))


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
				user_id=request.json.get('id'),
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


@social_manager.route('/activities', methods=['POST'])
def activities():
	if request.method == 'POST' and request.json:
		user_id = request.json.get('id')
		user_activities = Activity.query.filter_by(user_id=user_id).all()
		return render_template('activities.html', activities=user_activities)
	return '<h3 class="center">No Data Found !</h3>'


@social_manager.route('/logout', methods=['POST'])
def logout():
	if request.method == 'POST' and request.json:
		user_id = request.json.get('id')
		cache[user_id]['logged_in'] = False
		return jsonify({'status': 200, 'msg': 'Logged out succesfully'})
	return jsonify({'status': 500, 'msg': 'Bad request'})
