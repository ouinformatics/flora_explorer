import os
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


