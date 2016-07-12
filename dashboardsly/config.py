import json
import os


def get_banner_links():
    banner_links = [
        {'href': 'https://google.com', 'text': 'Financials'},
        {'href': 'https://google.com', 'text': 'Growth'},
        {'href': 'https://google.com', 'text': 'Performance'},
    ]

    bl_json = os.environ.get('PLOTLY_DASHBOARDSLY_DEFAULT_BANNER_LINKS')

    if not bl_json:
        print 'No banner links found in environment; using defaults'
        return banner_links

    try:
        banner_links = json.loads(bl_json)
    except ValueError as e:
        print 'Could not parse banner links: {}'.format(e)
        raise

    for link in banner_links:
        for attr in ('href', 'text'):
            if attr not in link:
                exc = 'banner link {} is missing a "{}" attribute'.format(link,
                                                                          attr)
                print exc
                raise ValueError(exc)

    return banner_links


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
    DEFAULT_BANNER_LINKS = get_banner_links()
    DEFAULT_BANNER_TITLE = os.environ.get(
        'PLOTLY_DASHBOARDSLY_DEFAULT_BANNER_TITLE', 'Quarterly Outlook')


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
