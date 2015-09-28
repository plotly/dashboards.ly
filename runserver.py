from dashboardsly import app

if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], port=8080)
