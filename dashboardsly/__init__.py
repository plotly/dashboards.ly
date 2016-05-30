import os
import sys
import logging

from flask import Flask
from flask.ext import assets
from flask.ext.compress import Compress
from flask.ext.cors import CORS
from flask.ext.sqlalchemy import SQLAlchemy

from flask_httpauth import HTTPBasicAuth
from flask_reverse_proxy import FlaskReverseProxied
from flask_sslify import SSLify


app = Flask(__name__)

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)


Compress(app)
CORS(app)
FlaskReverseProxied(app)


db = SQLAlchemy(app)
auth = HTTPBasicAuth()


env = assets.Environment(app)
env.load_path = [os.path.join(os.path.dirname(__file__), 'sass')]
env.register(
    'css_all',
    assets.Bundle(
        'skeleton.scss',
        filters='scss',
        output='css_all.css'
    )
)


if 'DYNO' in os.environ or 'DASHBOARDSLY_PROD' in os.environ:
    # production on Heroku
    app.config.from_object('dashboardsly.config.ProductionConfig')
elif os.environ.get('FLASK_CONFIG', '') == 'TEST':
    app.config.from_object('dashboardsly.config.TestingConfig')
else:
    # development on localhost
    app.config.from_object('dashboardsly.config.DevelopmentConfig')


if app.config['PLOTLY_ON_PREM']:
    app.config['DEFAULT_USERNAME'] = None
    app.config['DEFAULT_APIKEY'] = None

    if app.config['SSL_ENABLED']:
        # On-Prem, SSL enabled: temporary redirects, and disable HSTS
        # by setting the age to 60s.  (Allows SSL to be switched off.)
        SSLify(app, permanent=False, age=60)
else:
    app.config['DEFAULT_USERNAME'] = 'benji.b'
    app.config['DEFAULT_APIKEY'] = 'op16fm0vke'
    # Non-Prem: always enable SSL with permanent redirects and HSTS
    SSLify(app, permanent=True)


import dashboardsly.views
