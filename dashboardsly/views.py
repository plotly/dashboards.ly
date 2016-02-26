import requests
import json
import os
import shortuuid  # https://github.com/stochastic-technologies/shortuuid
import logging
import sys

import flask
from flask import render_template, request, abort

from flask.ext import assets
from flask.ext.cors import CORS
from flask.ext.sqlalchemy import SQLAlchemy
from flask_httpauth import HTTPBasicAuth
from werkzeug.security import generate_password_hash, check_password_hash
from flask_reverse_proxy import FlaskReverseProxied
from flask_sslify import SSLify

from dashboardsly import app
from dashboardsly import default_plots

SSLify(app, permanent=True)

proxied = FlaskReverseProxied(app)

db = SQLAlchemy(app)

app.logger.addHandler(logging.StreamHandler(sys.stdout))
app.logger.setLevel(logging.ERROR)

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

auth = HTTPBasicAuth()


@app.context_processor
def frontend_config():
    config = {
        'PLOTLY_DOMAIN': app.config['PLOTLY_DOMAIN'],
        'ROOT_PATH': request.script_root or '/',
    }
    return {
        'CONFIG': config,
        'USE_CONTENT_DELIVERY_NETWORKS':
            app.config['USE_CONTENT_DELIVERY_NETWORKS'],
        'PLOTLY_ON_PREM': app.config['PLOTLY_ON_PREM'],
    }


@app.route('/.well-known/acme-challenge/BzvoMFiLlTFGgADooJ6laj-uiHd418oM2fU_yL8FSWs')
def verify():
    return 'BzvoMFiLlTFGgADooJ6laj-uiHd418oM2fU_yL8FSWs.cQU-IDceRcQLJ7ir5GWuqnHl9BuJ5QjQ3_qlIolKss4'


@auth.verify_password
def verify_pw(username, password):
    if username == '':
        return False
    shortlink = request.path[1:]
    dashboard = Dashboard.query.get(shortlink)
    if dashboard is None:
        return True
    if dashboard.username != username:
        return False
    pw_hash = dashboard.pw_hash
    return check_password_hash(pw_hash, password)


class Dashboard(db.Model):
    __tablename__ = 'dashboards'
    shortlink = db.Column(db.String, primary_key=True)
    json = db.Column(db.Text)
    username = db.Column(db.Text)
    pw_hash = db.Column(db.Text)


def commit_dashboard(dashboard_json, username, password):
    dashboard = Dashboard(
        json=dashboard_json,
        shortlink=shortuuid.uuid(),
        username=username,
        pw_hash=generate_password_hash(password))

    db.session.add(dashboard)
    db.session.commit()
    return dashboard


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

def check_if_authenticated(username, apikey):
    # check if the user is authenticated
    # /folders/all is an authenticated endpoint, so query against
    # that resource to see if the API key is OK
    r = requests.head('{}/v2/folders/all'
                      '?user={}'.format(app.config['PLOTLY_API_DOMAIN'],
                                        username),
                      auth=requests.auth.HTTPBasicAuth(username, apikey),
                      headers={'plotly-client-platform': 'dashboardsly'})
    try:
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            authenticated = False
        else:
            abort(e.response.status_code)
    else:
        authenticated = True
    return authenticated

def files(username, apikey, page):
    # check if username exists. once /folders returns 404 on invalid username,
    # i can remove this
    r = requests.head('{}/v2/users/{}'.format(
        app.config['PLOTLY_API_DOMAIN'],
        username))
    try:
        r.raise_for_status()
    except requests.exceptions.HTTPError as e:
        abort(e.response.status_code)

    authenticated = check_if_authenticated(username, apikey)

    items = []
    pages = range((page + 1) * 2 - 1, (page + 1) * 2 + 1)
    for page in pages:
        url = ('{}/v2/folders/all'
               '?page={}&user={}'
               '&filetype=grid&filetype=plot'
               '&order_by=-date_modified'
               '').format(app.config['PLOTLY_API_DOMAIN'], page, username)
        if authenticated:
            auth = requests.auth.HTTPBasicAuth(username, apikey)
        else:
            auth = requests.auth.HTTPBasicAuth(
                app.config['DEFAULT_USERNAME'],
                app.config['DEFAULT_APIKEY'])
        r = requests.get(url, auth=auth, headers={
            'plotly-client-platform': 'dashboardsly'})
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

        for f in files:
            # don't show deleted files
            if f.get('deleted', '') is True:
                continue
            if f['filetype'] == 'plot':
                url = f['web_url']
                if f.get('share_key_enabled', '') is True:
                    url += '?share_key=' + f['share_key']
            elif f['filetype'] == 'grid':
                if f['world_readable'] is False:
                    continue  # gotta find a workaround to embedabble grids first.
                url = '/grid/' + f['api_urls']['grids'].split('/')[-1]
            items.append({
                'filetype': f['filetype'],
                'name': f['filename'],
                'url': url,
                'preview': _gridjson_to_tabular_form(f.get('preview', None),
                                                     preview=True)
            })

    return items, last, authenticated


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/google8786ccf07cde43db.html')
def google_verification():
    return render_template('google8786ccf07cde43db.html')


@app.route('/google5185f1ab89e0d6bf.html')
def webmasters_verification():
    return 'google-site-verification: google5185f1ab89e0d6bf.html'


@app.route('/robots.txt')
def robotron():
    return render_template('robots.txt')


@app.route('/files')
def get_files():
    username = request.args.get('username', app.config['DEFAULT_USERNAME'])
    page = int(request.args.get('page', 0))
    apikey = request.args.get('apikey', app.config['DEFAULT_APIKEY'])

    # cache benji.b's files
    if username == app.config['DEFAULT_USERNAME'] and page == 0:
        plots = default_plots.plots
        is_last = False
        is_authenticated = apikey == app.config['DEFAULT_APIKEY']
    else:
        is_last = False
        plots = []
        while not is_last and len(plots) < 15:
            paginated_plots, is_last, is_authenticated = files(
                username, apikey, page)
            plots.extend(paginated_plots)
            page += 1

    return flask.jsonify({
        'plots': plots,
        'is_last': is_last,
        'is_authenticated': is_authenticated})


@app.route('/publish', methods=['POST'])
def publish():
    dashboard_json = request.form['dashboard']
    dashboard = json.loads(dashboard_json)
    username = dashboard['auth']['username'] if dashboard['requireauth'] else ''
    password = dashboard['auth']['passphrase'] if dashboard['requireauth'] else ''
    dashboard.pop('auth')  # don't save the raw passphrase
    dashboard_json = json.dumps(dashboard)

    dashboard_obj = commit_dashboard(dashboard_json, username, password)
    dashboard_url = '/{}'.format(dashboard_obj.shortlink)
    if not dashboard['requireauth']:
        dashboard_url = '/ua-' + dashboard_url[1:]

    return flask.jsonify(
        url=dashboard_url
    )
    # return flask.redirect(dashboard_url, code=302)


@app.route('/create')
def create():
    return render_template('base.html', mode='create')


@app.route('/view')
def view():
    return render_template('base.html', mode='view')


@app.route('/grid/<fid>.embed')
def embed(fid):
    r = requests.get('{}/v2/grids/{}/content'.format(
        app.config['PLOTLY_API_DOMAIN'], fid))
    data = json.loads(r.content)['cols']
    tabular = _gridjson_to_tabular_form(data, preview=False)
    return render_template('grid.html',
                           cols=tabular['column_names'],
                           data=tabular['data'])


@app.route('/dashboard', methods=['GET'])
def serve_dashboard_json():
    shortlink = request.args.get('id')
    dashboard = Dashboard.query.get(shortlink)
    return flask.jsonify(
        content=json.loads(dashboard.json),
        shortlink=shortlink)


@app.route('/ua-<shortlink>', methods=['GET'])
def serve_unauthenticated_dashboard(shortlink):
    return render_template('base.html', mode='view')


@app.route('/<shortlink>', methods=['GET'])
@auth.login_required
def serve_authenticated_dashboard(shortlink):
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
