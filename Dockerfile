FROM ubuntu:14.04

RUN apt-get update && \
    apt-get -y install software-properties-common wget && \
    apt-add-repository 'deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main' && \
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add - && \
    apt-get update && \
    apt-get -y install python python-pip libpq-dev python-dev postgresql-client-9.4 && \
    apt-get clean

COPY requirements.txt /opt/dashboardsly/
RUN cd /opt/dashboardsly && pip install -r requirements.txt

COPY run-container /
COPY init_db.py runserver.py /opt/dashboardsly/
COPY dashboardsly /opt/dashboardsly/dashboardsly/

EXPOSE 80
CMD /run-container
