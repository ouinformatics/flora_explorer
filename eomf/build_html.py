
import urllib
import json
import pystache
import sys

taskname = sys.argv[1]

def getdescription(taskname):
    urlstring = pystache.render("http://test.cybercommons.org/mongo/db_find/taskui/description/%7B'find':%7B'uiname':'{{taskname}}'%7D%7D", {'taskname': taskname})
    return json.loads(urllib.urlopen(urlstring).read())[0]

description = getdescription(taskname);

print pystache.render(open('tasks.tmpl').read(),description);


