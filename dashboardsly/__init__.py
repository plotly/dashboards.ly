from flask import Flask
import os

app = Flask(__name__)

if 'DYNO' in os.environ:
    # production on Heroku
    app.config.from_object('dashboardsly.config.ProductionConfig')
elif os.environ.get('FLASK_CONFIG', '') == 'TEST':
    app.config.from_object('dashboardsly.config.TestingConfig')
else:
    # development on localhost
    app.config.from_object('dashboardsly.config.DevelopmentConfig')

import dashboardsly.views
