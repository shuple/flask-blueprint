# -*- coding: utf-8 -*-

import os, re, sys
import datetime, glob, json
import argparse, logging
import inspect, traceback
import flask, flask_session

root_path = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, f'{root_path}/../lib')
import logging_wrapper

# logging setting
logging_wrapper.init()

# Environment variable
env = {}

# Flask parameters
app = flask.Flask(__name__, static_url_path='/static')
app.config['SECRET_KEY'] = 'flask'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_FILE_DIR'] = f'{root_path}/session'
app.config['SESSION_FILE_THRESHOLD'] = 500
app.config['PERMANENT_SESSION_LIFETIME'] = datetime.timedelta(days=31)

# flask session
session = flask_session.Session()
session.init_app(app)

# Create a blueprint with 'bp' as the prefix
app_bp = flask.Blueprint('bp', __name__,static_folder='static', url_prefix='/bp')

@app_bp.before_request
def initialize():
    """ This function runs before each request """
    pass

@app_bp.route('/', methods=['GET'])
def root():
    """ Redirect to the index page """
    return flask.redirect('/index')

@app_bp.route('/index', methods=['GET'])
def index():
    """ Render the index page """
    return default_template()

@app_bp.route('/get/read', methods=['GET'])
def get_read():
    """
    Handles a GET request to '/get/read'.

    This function takes JSON data from the request and passes it to the api() for further processing.

    Returns:
        dict: The response from the api().
    """
    return api(dict(flask.request.args))

@app_bp.route('/post/read', methods=['POST'])
def post_read():
    """
    Handles a POST request to '/post/read'.

    This function takes JSON data from the request and passes it to the api() for further processing.

    Returns:
        dict: The response from the api().
    """
    return api(rest=flask.request.json)

# register Blueprint
app.register_blueprint(app_bp)

def api(rest):
    """
    Processes a REST API call based on the provided request data.

    Args:
        rest (dict): A dictionary containing the 'method' key and 'data' key.

    Returns:
        dict: The response from the dynamically called method or an error message in case of an exception.
    """
    try:
        method = f"post_{rest['method']}"
        data = getattr(sys.modules[__name__], method)(rest['data'])
    except Exception as e:
        logging.error(f'{method()}(): {flask.request.path} {traceback.format_exc()}')
        data = { 'error': traceback.format_exc() }
    return data

""" flask template """

def htm():
    """ Returns str: The filename (str) for an HTML template """
    return f'{template()}.htm'

def template():
    """  Returns str: The URL path before any query parameters """
    url = re.sub(r'/$', '', flask.request.path)
    url = '/'.join(url.split('/')[2:])
    return '/'.join(url.split('?')[0].split('/')[0:])

def default_template(data={}):
    """
    Renders a Flask template using the HTML file name and path derived from the current URL.

    Args:
        data (dict): Additional data to pass into the template.

    Returns:
        str: A rendered Flask template.
    """
    return flask.render_template(template_name_or_list=htm(), path=template(), env=env, data=data)

def method():
    """ Returns str: Caller function's function name """
    return inspect.currentframe().f_back.f_code.co_name

def parse_args():
    """ Returns dict: Parsed command line arguments """

    # Flask option
    parser = argparse.ArgumentParser(description='Flask backend')
    parser.add_argument('--host', default='0.0.0.0', help='Bind IP address')
    parser.add_argument('-d', '--debug', action='store_true', help='Debug mode')
    parser.add_argument('-p', '--port', type=int, default=44344, help='Bind port number')

    # logging option
    parser.add_argument('-l', '--log-file', default='')
    parser.add_argument(      '--log-level', default='info')
    parser.add_argument('-q', '--quiet', action='store_true', default=False)

    return vars(parser.parse_args())

if __name__ == '__main__':
    # Parse command line argument
    args = parse_args()

    # logging setting
    logging_wrapper.init(args)

    # Start Flask app
    app.run(host=args['host'], port=args['port'], debug=args['debug'])
