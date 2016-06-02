FROM ubuntu:14.04

RUN apt-get update
RUN apt-get -y install software-properties-common wget curl
RUN apt-add-repository 'deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main'
RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
RUN apt-get update
RUN apt-get -y install python python-pip libpq-dev python-dev postgresql-client-9.4
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN apt-get clean

COPY requirements.txt /opt/dashboardsly/
RUN cd /opt/dashboardsly && pip install -r requirements.txt

COPY package.json /opt/dashboardsly/
RUN cd /opt/dashboardsly && npm install

COPY run-container /
COPY init_db.py runserver.py /opt/dashboardsly/
COPY dashboardsly /opt/dashboardsly/dashboardsly/

RUN cd /opt/dashboardsly && npm run build

EXPOSE 80
CMD /run-container
