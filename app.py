import flask
from flask import Flask, render_template, request
from flask.ext import assets
from flask.ext.cors import CORS

import requests
import json
import os

app = Flask(__name__)
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

CORS(app)


def files():
    r = requests.get('https://api.plot.ly/v2/folders/home?user=chriddyp')
    r.raise_for_status()
    c = json.loads(r.content)
    files = c['children']['results']
    items = [
        {
            'plot_name': f['filename'],
            'plot_url': f['web_url']
        } for f in files if f['filetype'] == 'plot'
    ]
    return items


@app.route('/files')
def get_files():
    return flask.jsonify({'plots': files()})


@app.route('/')
def base():
    return render_template('base.html')


@app.route('/dashboard')
def dashboard():
    items = file()
    return render_template(
        'dashboard.html',
        plots=items[:9],
        builder=True)


@app.route('/create')
def create():
    plots = request.args['plots']
    return render_template('dashboard.html', plots=plots)


if __name__ == '__main__':
    app.run(debug=True, port=8080)
