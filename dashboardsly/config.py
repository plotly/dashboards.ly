import os


class Config(object):
    PLOTLY_API_DOMAIN = os.environ.get(
        'PLOTLY_API_DOMAIN', 'https://api.plot.ly')
    PLOTLY_DOMAIN = os.environ.get(
        'PLOTLY_DOMAIN', 'https://plot.ly')
    PLOTLY_DOMAIN_EXT = os.environ.get(
        'PLOTLY_DOMAIN_EXT', PLOTLY_DOMAIN)
    USE_CONTENT_DELIVERY_NETWORKS = bool(int(os.environ.get(
        'PLOTLY_USE_CONTENT_DELIVERY_NETWORKS', 1)))
    PLOTLY_ON_PREM = bool(int(os.environ.get(
        'PLOTLY_ON_PREM', 0)))
    SSL_ENABLED = bool(int(os.environ.get(
        'PLOTLY_DASHBOARDSLY_SSL_ENABLED', 1)))


class ProductionConfig(Config):
    """
    Heroku
    """
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', '')
    ENVIRONMENT = 'PROD'


class DevelopmentConfig(Config):
    """
    localhost
    """
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://user:password@192.168.99.100/postgres'
    ENVIRONMENT = 'DEV'


class TestingConfig(DevelopmentConfig):
    import warnings
    warnings.filterwarnings('ignore')
    # http://stackoverflow.com/questions/26647032/py-test-to-test-flask-register-assertionerror-popped-wrong-request-context
    PRESERVE_CONTEXT_ON_EXCEPTION = False
    TESTING = True
    ENVIRONMENT = 'TEST'
