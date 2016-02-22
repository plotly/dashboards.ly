FROM ubuntu:14.04

RUN apt-get update && \
    apt-get -y install python python-pip libpq-dev python-dev && \
    apt-get clean

COPY init_db.py requirements.txt runserver.py /opt/dashboardsly/
COPY dashboardsly /opt/dashboardsly/dashboardsly/

RUN cd /opt/dashboardsly && pip install -r requirements.txt

EXPOSE 80
CMD cd /opt/dashboardsly; gunicorn runserver:app --log-file=- -b 0.0.0.0:80
