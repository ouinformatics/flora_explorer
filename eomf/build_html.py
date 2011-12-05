
import urllib
import json
import pystache

def getdescription(taskname):
    urlstring = pystache.render("http://test.cybercommons.org/mongo/db_find/taskui/description/%7B'find':%7B'task.taskname':'{{taskname}}'%7D%7D", {'taskname': taskname})
    return json.loads(urllib.urlopen(urlstring).read())[0]

description = getdescription('cybercomq.static.tasks.modiscountry');

print pystache.render(open('tasks.tmpl').read(),description);


