from datetime import datetime
import json
import csv
import ast,os
from StringIO import StringIO

from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render_to_response
from django.template.context import RequestContext
from django.contrib.auth.decorators import login_required

#flora workflow
import floradata
#Pymongo imports
from pymongo.connection import Connection
from pymongo import ASCENDING
from shutil import copyfile
#Mongo connection
db = Connection('localhost')


def index_flora(request, label=11):
    try:
        q = int(label)
    except:
        q = -1
    no_data = 'False'
    dat = db.flora.data.find({"REF_NO": {"$gte": q, "$lt": q + 1}})
    if dat.count() == 0:
        no_data = 'True'
    data = {'label': label, 'no_data': no_data}
    return render_to_response('flora/index_flora.html', data, context_instance=RequestContext(request))


@login_required()
def upload_data(request):
    if request.method == 'POST':
        #form = UploadFileForm(request.POST, request.FILES)
        #if form.is_valid():
        if request.POST['formtype'] == 'UPLOAD':
            now = datetime.now()
            ts = now.strftime("%Y_%m_%dT%H%M%S")
            names = {}
            data = {}
            for files in request.FILES.keys():
                names[files] = request.FILES[files].name
                handle_uploaded_file(request.FILES[files])
            try:
                floradata.dataUploadWorkflow(db, names, ts)
                message = "Loaded Data File - %s<br>" % (names['floradata'])
            except Exception as inst:
                message = "<span style='color:red;'>Error Data File: %s<br>%s</span>" % (names['floradata'], str(inst))
                data = {'set': '', 'message': message}
                message = json.dumps(data)
                return HttpResponse(message)
            try:
                floradata.load_endnote_allfields(db, names, ts)
                message = "%sLoaded Endnote All Fields - %s<br>" % (message, names['allfields'])
            except Exception as inst:
                message = "%s<span style='color:red;'>Error Endnote All Fields File: %s<br>%s</span>" % (
                message, names['allfields'], str(inst))
                data = {'set': '', 'message': message}
                message = json.dumps(data)
                return HttpResponse(message)
            try:
                floradata.load_citation(db, names, ts)
                message = "%sLoaded Bibtex and RIS Files - %s, %s<br>" % (message, names['bitext'], names['ris'])
            except Exception as inst:
                message = "%s<span style='color:red;'>Error Bibtex and RIS Files: %s, %s<br>%s</span>" % (
                message, names['bitext'], names['ris'], str(inst))
                data = {'set': '', 'message': message}
                message = json.dumps(data)
                return HttpResponse(message)
            data = {'set': 'data%s' % (ts), 'message': message}
            message = json.dumps(data)
        elif request.POST['formtype'] == 'SETDATA':
            ts = request.POST['dataset'][4:]
            message = floradata.movedata(ts)# "this is the set option"
            data = {'set': '', 'message': message}
            message = json.dumps(data)
        elif request.POST['formtype'] == 'UPLOAD-HELP':
            names = {}
            for files in request.FILES.keys():
                names[files] = request.FILES[files].name
                handle_uploaded_file(request.FILES[files])
            for ufile in names:
                src = os.path.join(settings.UPLOAD_DIR, names[ufile])
                dst = os.path.join(settings.STATIC_DOC_ROOT, "flora/user_guide.pdf")
                print src, dst
                copyfile(src, dst)
                os.remove(src)
                ug_url = "<a href='%s' target='_blank' style='color:blue' >User Guide</a>" % (settings.STATIC_URL + "flora/user_guide.pdf")
            message = "User guide uploaded. <br> Please click to double check file uploaded. %s" % (ug_url)
            data = {'set': '', 'message': message}
            message = json.dumps(data)
        else:
            message = "<span style='color:red;'>Error FormType: Not set please check form submission</span>"

        return HttpResponse(message)
    else:
        data = []
        for col in db[settings.MONGO_DATABASE].collection_names():
            if col[0:5] == 'data2':
                data.append(col)
        template = 'flora/data.html'
        data = {'data_list': data}
        return render_to_response(template, data, context_instance=RequestContext(request))


def handle_uploaded_file(f):
    with open('%s/%s' % (settings.UPLOAD_DIR, f.name), 'w') as destination:
        for chunk in f.chunks():
            destination.write(chunk)


def index1(request):
    template = 'flora/index2.html'
    sel = db.flora.endnote.find({"DataKeys": {"$exists": True}}, {'ShortTitle': 1, 'Label': 1}).sort('Label', ASCENDING)
    data = {'select': sel}
    return render_to_response(template, data, context_instance=RequestContext(request))


def ajax_bib_search(request):
    q = request.GET.get('q')
    dat = 'No Data'
    dat1 = 'No Data'
    dat2 = 'No Data'
    no_data = 'False'
    #    ctab = 1
    if q is not None:
        try:
            q = int(q)
        except:
            q = -1
        results = db.flora.endnote.find({"Label": q})#,"DataKeys":{"$exists" :True}})
        if results.count() > 0:
            dat = db.flora.data.find({"REF_NO": {"$gte": q, "$lt": q + 1}}).sort('REF_NO')
            if dat.count() == 0:
                no_data = 'True'
            dat1 = db.flora.data.find({"REF_NO": {"$gte": q, "$lt": q + 1}}).sort('REF_NO')
            dat2 = db.flora.data.find({"REF_NO": {"$gte": q, "$lt": q + 1}}).sort('REF_NO')
        template = 'flora/results.html'
        data = {'results': results, 'dat': dat, 'dat1': dat1, 'dat2': dat2, 'no_data': no_data}
        #print data
        return render_to_response(template, data, context_instance=RequestContext(request))


@csrf_exempt
def get_datafile(request, query=None, database=settings.MONGO_DATABASE, col='data'):
    head = ['REF_NO', 'Pubtype', 'Sitename', 'Country', 'State', 'Year', 'Latitude_S_edge', 'Latitude_N_edge',
            'Longitude_E_edge', 'Longitude_W_edge', 'Min_Elev_m', 'Max_Elev_m', 'Area_hectares', 'midlat', 'midlon',
            'midelev', 'Parcels',
            'Flora_definition', 'Arbitrary', 'Habitat', 'Physiographic', 'Political', 'Preservetype', 'Jurisdiction',
            'Bot_effort', 'NO_Families',
            'NO_Genera', 'NO_Species', 'NO_Tot_Taxa', 'NO_Indig_Spp', 'perc_exot', 'shortstatus', 'Proofing_notes']
    headline = "REF_NO,Pubtype,Sitename,Country,State,Year,Latitude_S_edge,Latitude_N_edge,Longitude_E_edge,Longitude_W_edge,Min_Elev_m,Max_Elev_m,Area_hectares,midlat,midlon,  midelev,Parcels,Flora_definition,Arbitrary,Habitat,Physiographic,Political,Preservetype,Jurisdiction,Bot_effort,NO_Families,NO_Genera,NO_Species,NO_Tot_Taxa,NO_Indig_Spp,Percent_  Exotic,Shortstatus,Proofing_notes\n"
    if request.method == 'POST':
        try:
            #format=request.POST['format']
            query = request.POST['query']
        except Exception as inst:
            return str(inst)
        if query:
            query = ast.literal_eval(query)
            query['fields'] = head
            cur = db[database][col].find(**query).sort('REF_NO')
        else:
            cur = db[database][col].find().sort('REF_NO')
        outfile = StringIO()
        outfile.write(headline)
        cwrite = csv.DictWriter(outfile, head)
        err = ''
        for row in cur:
            row['State'] = json.dumps(row['State'])
            row.pop('_id')
            try:
                cwrite.writerow(row)
            except:
                err = err + " Error REF_NO " + str(row['REF_NO']) + "\n"
        outfile.write(err)
        outfile.seek(0)
        outdata = outfile.read()
        response = HttpResponse(outdata, mimetype='application/octetstream')
        response['Content-Disposition'] = 'attachment; filename="flora-data-download.csv"'# + format + '"'
        return response
    else:
        return HttpResponse('Error - Must be POST')
        #  cherrypy.response.headers['Content-Disposition']= 'attachment; filename="flora-data-download.' + format + '"'
        #  return outdata


@csrf_exempt
def getbib(request, format=None, query=None, database=settings.MONGO_DATABASE, col='citation'):
    if request.method == "POST":
        try:
            format = request.POST['format']
            query = request.POST['query']
        except Exception as inst:
            return str(inst)
        fformat = {'endnote': 'enl', 'ris': 'ris', 'bibtex': 'txt'}
        if not format:
            return "Service Requires Format ['ris','bibtex']"
        if query:
            query = ast.literal_eval(query)
            cur = db[database][col].find(**query)
        else:
            cur = db[database][col].find()
        outfile = StringIO()
        for row in cur:
            outfile.write(row[format])
            outfile.write('\n \n')
        outfile.seek(0)
        outdata = outfile.read()
        response = HttpResponse(outdata, mimetype='application/octetstream')
        response['Content-Disposition'] = 'attachment; filename="' + format + '-downloaded.' + fformat[format] + '"'
        return response
    else:
        return HttpResponse('Error - Must be POST')
        #cherrypy.response.headers['Content-Disposition']= 'attachment; filename="' + format + '-downloaded.' + fformat[format] + '"'
        #return outdata
