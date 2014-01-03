import os
if os.uname()[1] == 'test.cybercommons.org':
    basedir = '/var/www/apps'
elif os.uname()[1] == 'fire.rccc.ou.edu':
    basedir = '/scratch/www/wsgi_sites'
elif os.uname()[1] == 'production.cybercommons.org':
    basedir = '/var/www/apps'

activate_this = basedir + '/florabib/virtpy/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))


import sys
# put the Django project on sys.path
if basedir not in sys.path:
    sys.path.append(basedir)

import site
site.addsitedir(basedir + '/florabib')

os.environ['DJANGO_SETTINGS_MODULE'] = 'florabib.settings'

import django.core.handlers.wsgi
application = django.core.handlers.wsgi.WSGIHandler()


