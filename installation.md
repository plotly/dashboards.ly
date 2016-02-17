### Instructions for running dashboards.ly

dashboards.ly will be available in the next On-Premise release of
plotly. In the meantime, here are some instructions to run your own version of
dashboards.ly on your own servers.

1 - Clone the repo
```
$ git clone https://github.com/plotly/dashboards.ly.git
$ cd dashboards.ly
```

2 - Install dependencies into a python 2.7 virtual environment
```
$ pip install virtualenv
$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
```

3 - Install postgres

4 - Set environment config variables

There are multiple configuration settings:
"ProductionConfig", "TestingConfig", and "DevelopmentConfig".

These are set here: https://github.com/plotly/dashboards.ly/blob/master/dashboardsly/__init__.py

The variables in each of these environments are here: https://github.com/plotly/dashboards.ly/blob/master/dashboardsly/config.py


Here is an example of setting the environment variables
```
# Use the "production" environment
DASHBOARDLY_PROD="true"; export DASHBOARDLY_PROD

# Set the Postgres Database URI
DATABASE_URL="postgresql://chriddyp@localhost/chriddyp"; export DATABASE_URL;

# If you're running Plotly On-Premise,
# dashboards.ly can be configured to load graphs from your enterprise server
PLOTLY_API_DOMAIN="https://plotly.acme.com"
PLOTLY_DOMAIN="https://plotly.acme.com"
```

5 - Initialize the database
```
$ python init_db.py
```

6 - Run the server
```
$ gunicorn runserver:app
```
