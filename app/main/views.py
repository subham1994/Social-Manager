from flask import render_template, redirect, request, url_for, jsonify
from . import social_manager
from .. import db
from ..models import User, Page


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
				return jsonify({'status': 200, 'redirect_to': url_for('pages')})
		except Exception as e:
			print(e)
		else:
			return jsonify({'status': 500})
	return render_template('login.html')


@social_manager.route('/pages/<user_id>')
def pages(user_id):
	print(url_for('static', filename='vendor/materialize/js/materialize.min.js'))
	user = User.query.get(user_id)
	return render_template('pages.html', user=user)
