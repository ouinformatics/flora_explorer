import pymongo, json, logging, sys

jsonfile = sys.argv[1]

logging.basicConfig(level=logging.INFO)

try:
    con = pymongo.Connection('fire.rccc.ou.edu')
    logging.info('Connected to mongo...')
    db = con['taskui']
    col = db['description']
except:
    logging.exception('Had trouble connecting to mongodb')

try:
    jsonstring = open(jsonfile).read()
    logging.info('Read json configuration...')
except:
    logging.exception('Error reading file, does it exist?')

try:
    pydict = json.loads(jsonstring)
    logging.info('Converted json to python...')
except:
    logging.exception('Had trouble converting json to python, check syntax')

try:
    col.update({'uiname': pydict['uiname']}, pydict, upsert=True)
    logging.info('Updating data in mongodb...')
except:
    logging.exception('Insertion error...')
