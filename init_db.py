from dashboardsly import views

if __name__ == '__main__':
    views.db.session()
    views.db.metadata.create_all(views.db.engine)
