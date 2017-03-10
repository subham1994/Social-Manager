Technologies Used:
    - Flask, jquery, materialize.css, python 3.5
    - Application tested on: Firefox Version 50.1.0

Note:
    - This application makes use of javascript promises which may not be
      supported by some older browsers and the application might not behave as expected

Features:
    - Users can Log in to the application using their facebook account
    - Users can view all the pages that they own
    - Users can upload images to any of the pages they own
    - Users can track their activity i.e. details about image they upload


Project Structure:

    |- app
       |- main
          | - __init__.py
          | - errors.py
          | - forms.py
          | - views.py
       | - static
          | - local
             | - css
                | - style.css
             | - js
                | - script.js
          | - vendor
       | - templates
       | - __init__.py
       | - models.py
    | - migrations
    | - config.py
    | - manage.py
    | - README.txt
    | - requirements.txt