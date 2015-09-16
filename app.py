import flask
from flask import Flask, render_template, request, abort
from flask.ext import assets
from flask.ext.cors import CORS

import requests
import json
import os

app = Flask(__name__)
app.config['DEBUG'] = True

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


def files(username, page):
    # check if username exists. once /folders returns 404 on invalid username,
    # i can remove this
    r = requests.head('https://api.plot.ly/v2/users/{}'.format(username))
    try:
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        abort(e.response.status_code)

    items = []
    pages = range((page + 1) * 2 - 1, (page + 1) * 2 + 1)
    for page in pages:
        r = requests.get('https://api.plot.ly/v2/folders/home'
                         '?page={}&user={}'
                         '&filetype=plot'
                         '&order_by=date_modified'.format(page, username))
        try:
            r.raise_for_status()
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404 and page > pages[0]:
                break
            else:
                abort(e.response.status_code)

        c = json.loads(r.content)
        files = c['children']['results']
        if c['children']['next'] is None:
            last = True
        else:
            last = False
        items.extend([
            {
                'plot_name': f['filename'],
                'plot_url': f['web_url']
            } for f in files
        ])

    return items, last


@app.route('/files')
def get_files():
    username = request.args.get('username', 'chriddyp')
    page = int(request.args.get('page', 0))
    plots, is_last = files(username, page)
    return flask.jsonify({'plots': plots, 'is_last': is_last})


@app.route('/')
def create():
    return render_template('base.html', mode='create')


@app.route('/view')
def view():
    return render_template('base.html', mode='view')


@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also to cache the rendered page for 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response

if __name__ == '__main__':
    app.run(debug=True, port=8080)
