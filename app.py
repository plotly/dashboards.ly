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


def _gridjson_to_tabular_form(gridjson, preview):
    if gridjson is None or gridjson == '':
        return gridjson
    if isinstance(gridjson, basestring):
        gridjson = json.loads(gridjson)

    if preview:
        ordered_cols = [k for k in gridjson]
        tabular_data = zip(*[gridjson[c][:6] for c in ordered_cols])
    else:
        # full grid json
        ordered_cols = sorted((c for c in gridjson),
                              key=lambda c: int(gridjson[c]['order']))
        tabular_data = zip(*[gridjson[c]['data'][0:50] for c in ordered_cols])

    return {'column_names': ordered_cols, 'data': tabular_data}


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
                         '&filetype=grid&filetype=plot'
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

        print 'files: ', files
        items.extend([
            {
                'filetype': f['filetype'],
                'name': f['filename'],
                'url': (f['web_url'] if f['filetype'] == 'plot'
                        else ('/grid/' +
                              f['api_urls']['grids'].split('/')[-1])),
                'preview': _gridjson_to_tabular_form(f.get('preview', None),
                                                     preview=True)
            } for f in files
        ])

    return items, last


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/files')
def get_files():
    username = request.args.get('username', 'chriddyp')
    page = int(request.args.get('page', 0))
    plots, is_last = files(username, page)
    return flask.jsonify({'plots': plots, 'is_last': is_last})


@app.route('/create')
def create():
    return render_template('base.html', mode='create')


@app.route('/view')
def view():
    return render_template('base.html', mode='view')


@app.route('/grid/<fid>.embed')
def embed(fid):
    r = requests.get('https://api.plot.ly/v2/grids/{}/content'.format(fid))
    data = json.loads(r.content)['cols']
    tabular = _gridjson_to_tabular_form(data, preview=False)
    return render_template('grid.html',
                           cols=tabular['column_names'],
                           data=tabular['data'])


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
