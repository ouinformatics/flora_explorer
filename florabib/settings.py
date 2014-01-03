# Django settings for flora project.
import os
DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)
LOGIN_URL = '/florabib/login/'
#UPLOAD_DIR used for Flora data upload module
#Apache need to be have permission to read/write to directory
UPLOAD_DIR='/var/www/html/upload'
MONGO_DATABASE ='flora'
MANAGERS = ADMINS
# Apache need to be have permission to read/write to directory
# and flora.db sqlite file. If you want to recreate database, delete 
# file and run python command  "python manage.py syncdb"
DBFILE="%s/flora.db" % (os.path.abspath(os.path.join(os.path.dirname(__file__), 'data')))
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': DBFILE,                      # Or path to database file if using sqlite3.
        'USER': '',                      # Not used with sqlite3.
        'PASSWORD': '',                  # Not used with sqlite3.
        'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
    }
}
# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = ''#http://static.cybercommons.org/media/django_admin/media/'

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
#ADMIN_MEDIA_PREFIX = ''
STATIC_URL = '/florabib/static/'#http://static.cybercommons.org/media/django_admin/media/'
#ADMIN_MEDIA_PREFIX = '/static/' #http://static.cybercommons.org/media/django_admin/media/'
# Make this unique, and don't share it with anybody.
SECRET_KEY = 'AAAAAAAAAAcs#8kq1_s=qymch44d1#ru-y1p-tu8n^hdn2yj1j=i%grus$m8'
# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)
# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)

ROOT_URLCONF = 'florabib.urls'

TEMPLATE_DIRS = (
    os.path.abspath(os.path.join(os.path.dirname(__file__), 'templates')),
    #os.path.abspath(os.path.join(os.path.dirname(__file__), 'temp1')),
    #os.path.abspath(os.path.join(os.path.dirname(__file__), 'virtpy/lib/python2.6/site-packages/django/contrib/auth/tests/templates/')),
    # '/scratch/www/html/templates/flora'
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)
STATICFILES_DIRS = (
   os.path.abspath(os.path.join(os.path.dirname(__file__), 'static')),
   #os.path.join(BASE_DIR, "static"),
   # 'django.contrib.admin.static',
)
INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'florabib.flora',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
     'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
     'django.contrib.admindocs',
)
STATIC_DOC_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), 'static'))#'static'#os.path.abspath(os.path.join(os.path.dirname(__file__),'static'))
