from django.conf.urls.defaults import patterns, include, url
from django.conf import settings
from django.conf.urls.defaults import *
#from project.views import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    #(r'^$', 'flora.views.index1'),
    (r'^$', 'flora.views.index_flora'),
    (r'^(\d{1,6})/$', 'flora.views.index_flora'),
    (r'^upload_data$','flora.views.upload_data'),
    (r'^get_datafile$','flora.views.get_datafile'),
    (r'^getbib$','flora.views.getbib'),
   # (r'^data$','flora.views.data'),
    url( r'^flora/$', 'flora.views.ajax_bib_search', name = 'demo_bib_search' ),
    (r'^static/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.STATIC_DOC_ROOT}),
    # url(r'^$', 'project.views.home', name='home'),
    # url(r'^project/', include('project.foo.urls')),
    url(r'^login/$', 'django.contrib.auth.views.login',
    {'template_name': 'registration/login.html'}),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
     url(r'^admin/', include(admin.site.urls)),
)
