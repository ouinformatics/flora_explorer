from fabric.api import *
from fabric.contrib.files import exists, append, comment
from fabric.colors import red
import os 
#Need to set group to apache user and set group status to read write to database
florabib_cmd = 'chmod -R 775 /var/www/apps/florabib/data;chgrp -R apache /var/www/apps/florabib/data'
florabib_cmd1 = 'chmod -R 775 /var/www/apps/florabib/static;chgrp -R apache /var/www/apps/florabib/static'

env.sitename = os.path.basename(os.getcwd())
env.mongo_host = 'fire.rccc.ou.edu'
env.psql_host = 'fire.rccc.ou.edu'
env.apache_config = '/etc/httpd/conf.d/%(sitename)s.conf' % env
env.python = '/usr/bin/python2.6'

def ows_test():
    """
    Work on staging environment
    """
    env.settings = 'ows_test'
    env.path = '/var/www/apps/%(sitename)s' % env
    env.virtpy = '%(path)s/virtpy' % env
    env.log_path = '%(path)s/log' % env
    env.hosts = ['test.oklahomawatersurvey.org']
def ows_data():
    """
    Work on staging environment
    """
    env.settings = 'ows_data'
    env.path = '/var/www/apps/%(sitename)s' % env
    env.virtpy = '%(path)s/virtpy' % env
    env.log_path = '%(path)s/log' % env
    env.hosts = ['data.oklahomawatersurvey.org']
 
def testing():
    """
    Work on staging environment
    """
    env.settings = 'testing'
    env.path = '/var/www/apps/%(sitename)s' % env
    env.virtpy = '%(path)s/virtpy' % env
    env.log_path = '%(path)s/log' % env
    env.hosts = ['test.cybercommons.org']

def fire():
    """
    Setup on fire.rccc.ou.edu
    """
    env.settings = 'production'
    env.path = '/scratch/www/wsgi_sites/%(sitename)s' % env
    env.virtpy = '%(path)s/virtpy' % env
    env.log_path = '%(path)s/log' % env
    env.hosts = ['fire.rccc.ou.edu']

    
def production():
    """
    Work on production environment
    """
    env.settings = 'production'
    env.path = '/var/www/apps/%(sitename)s' % env
    env.virtpy = '%(path)s/virtpy' % env
    env.log_path = '%(path)s/log' % env
    env.hosts = ['production.cybercommons.org']
    
def setup():
    """ 
    Setup directories and copy everything but virtual environment to server,
        then install virtual environment based on requirements.txt
    """
    setup_directories()
    copy_working_dir()
    setup_virtualenv()
    install_requirements()
    apache_config()
    sudo(florabib_cmd)
    bounce_apache()

def deploy():
    """
    Deploy changes which don't impact virtual environment
    """ 
    bounce_apache('stop')
    copy_working_dir()
    sudo(florabib_cmd)
    sudo(florabib_cmd1)
    bounce_apache('start')

def setup_directories():
    """ 
    Setup directories on the remote system
    """
    if not exists('%(path)s' % env):
        run('mkdir -p %(path)s' % env)
        run('mkdir -p %(log_path)s' % env)
        run('mkdir -p %(virtpy)s' % env)


def virtualenv(command):
    """ 
    Wrapper to activate and run virtual environment
    """
    with cd(env.virtpy):
        run('source %(virtpy)s/bin/activate' % env + '&&' + command)

def setup_virtualenv():
    """
    Install the virtual environment
    """
    run('virtualenv -p %(python)s --no-site-packages %(virtpy)s' % env)

def bounce_apache(option=None):
    """ Restart the apache web server """
    if option:
        cmd='/etc/init.d/httpd %s' % (option)
        sudo(cmd)
    else:
        sudo('/etc/init.d/httpd restart')

def apache_config(secure=False):
    """
    Set the apache config file to point to wsgi.  Assumes app will be accessible at /sitename/ and 
      .wsgi named sitename.wsgi
    """
    # check if apache config lines exist in old wsgi_sites.conf and comment if found
    comment('/etc/httpd/conf.d/wsgi_sites.conf', r'^WSGIScriptAlias /%(sitename)s .*$' % env, use_sudo=True)
    confline = 'WSGIScriptAlias /%(sitename)s %(path)s/%(sitename)s.wsgi' %env
    append('%(apache_config)s' % env, confline, use_sudo=True)
    if secure:
        secure_app = """
<Location /%(sitename)s>
  AuthType Basic 
  require valid-user
  TKTAuthLoginURL /accounts/login/
  TKTAuthTimeoutURL /accounts/login/?timeout=1 
  TKTAuthPostTimeoutURL /accounts/login/?posttimeout=1 
  TKTAuthUnauthURL /accounts/login/?unauth=1 
  TKTAuthIgnoreIP on
  TKTAuthBackArgName next
</Location>
""" % (env)
        append('%(apache_config)s' % env, secure_app, use_sudo=True)

def copy_working_dir():
    """
    Shuttle application code from local to remote
    """
    local('tar --exclude virtpy -czf /tmp/deploy_%(sitename)s.tgz .' % env)
    put('/tmp/deploy_%(sitename)s.tgz' % env, '%(path)s/deploy_%(sitename)s.tgz' % env)
    run('cd %(path)s; tar -xf deploy_%(sitename)s.tgz; rm deploy_%(sitename)s.tgz' % env)
    local('rm /tmp/deploy_%(sitename)s.tgz' % env)
def copy_db():
    get('%(path)s/data/flora.db' % env,'data/flora.db')
def install_requirements():
    """ 
    Install the contents of requirements.txt to the virtual environment 
    """
    check = exists('%(path)s/requirements.txt' % env)
    if check:
        virtualenv('pip install -r %(path)s/requirements.txt' % env)
    else:
        print red("Can't find requirements.txt!")

def upgrade_requirements():
    """ 
    Install the contents of requirements.txt to the virtual environment 
    """
    check = exists('%(path)s/requirements.txt' % env)
    if check:
        virtualenv('pip install --upgrade -r %(path)s/requirements.txt' % env)
    else:
        print red("Can't find requirements.txt!")
