from django.conf import settings
#from datetime import datetime
from subprocess import check_call,STDOUT
from django.template.loader import get_template
from django.template import Context
#from pybtex.database.input import bibtex
#import codecs
#import unicodedata

def data_clean(filename,database,collection):
    t = get_template('data/cleandata.js')
    jstext= t.render(Context({'database': database,'collection':collection}))
    file='%s%s' %(filename,'.js')
    f1=open(file,'w')
    f1.write(jstext)
    return file
def movedata(ts):#,database,filename):
    t = get_template('data/movedata.js')
    jstext= t.render(Context({'database': settings.MONGO_DATABASE,'ts':ts}))
    filename='%s/%s' % (settings.UPLOAD_DIR,'move.js')
    f1=open(filename,'w')
    f1.write(jstext)
    f1.close()
    logpath = '%s.log' % (filename)
    logfile= open(logpath,"w")
    check_call(['mongo',filename],stdout=logfile,stderr=STDOUT)
    return 'Success'

def dataUploadWorkflow(db,filenames,ts):
    #now = datetime.now()
    #ts= now.strftime("%Y_%m_%dT%H%M%S")
    try:
        collection= 'data%s' % (ts)
        filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['floradata'])
        bib_filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['bitext'])
        ris_filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['ris'])
        all_filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['allfields'])
        logpath = '%s/%s.log' % (settings.UPLOAD_DIR,filenames['floradata'])
        logfile= open(logpath,"w")
        check_call(['dos2unix',filename,bib_filename,ris_filename,all_filename],stdout=logfile,stderr=STDOUT)
        #convert to unicode
        f1=open(filename,'r')
        filename= '%s%s' % (filename,'_enc')
        f2=open(filename,'w')
        text=f1.read() 
        text=text.replace('Latitude_S_edge)','Latitude_S_edge')
        text=text.replace('NO_Indig_Spp.','NO_Indig_Spp')
        try:
            head='REF_NO,Pubtype,Entered_by,Sitename,perc_exot,Country,State1,State2,State3,State4,State5,State6,State7,State8,Year,Latitude_S_edge,Latitude_N_edge,Longitude_E_edge,Longitude_W_edge,Min_Elev_m,Max_Elev_m,Area_hectares,midlat,midlon,midelev,Parcels,Flora_definition,Arbitrary,Habitat,Physiographic,Political,Preservetype,Jurisdiction,Bot_effort,NO_Families,NO_Genera,NO_Species,NO_Tot_Taxa,NO_Indig_Spp,Status,shortstatus,Proofing_notes'
            if text.find(head)<0:
                raise Exception("Data File header doesn't contain Flora Data Fields. Header should contain-><p style='margin-left:15px;width:800px;word-wrap:break-word;'>%s</p>" % (head))
        except Exception as inst:
            raise inst
        text=unicode(text,errors='ignore')
        f2.write(text)
        f2.close()
        f1.close()
        #load into mongo
        check_call(['mongoimport','--db',settings.MONGO_DATABASE,'--collection',collection,'--drop','--type','csv','--file',filename,'--headerline'],stdout=logfile,stderr=STDOUT)
        check_call(['mongo',data_clean(filename,settings.MONGO_DATABASE,collection)],stdout=logfile,stderr=STDOUT)
        logfile.close()
    except Exception as inst:
        logfile.close()
        raise inst
    return ts 
def load_citation(db,filenames,ts):
    #open a bibtex and ris files
    bib_filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['bitext'])
    ris_filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['ris'])
    f1=open(bib_filename,'r')
    temp='\n%s' % (f1.read())
    bib_list=temp.split('\n@')
    del bib_list[0]
    bib_data=[]
    for bib in bib_list:
        data={}
        text= '%s%s' % ('@',bib)
        data['bibtex']=text.strip()
        try:
            label =text.replace('{','#Z#',1).replace(',','#Z#',1).split('#Z#')[1]
        except Exception as inst:
            raise inst
        try:
            label=int(label)
            data['label']=label
        except Exception as inst:
            raise Exception("Label field must be an interger - Label Value: '%s'" % (label))
        bib_data.append(data)
    f1.close()
    f1=open(ris_filename,'r')
    ris_list=f1.read().split('ER  -')
    del ris_list[-1]
    for ris in ris_list:
        if not ris.strip()=='':
            text= '%s\n%s' % (ris.strip(),'ER  -')
            try:
                label=text.replace('LB  -','#Z#',1).split('#Z#')[1].replace('\n','#Z#',1).split('#Z#')[0].strip()
            except Exception as inst:
                raise inst
            try:
                label=int(label)
            except Exception as inst:
                raise Exception("Label field must be an interger - Label Value: '%s'" % (label))
            for b in bib_data:
                if b['label']==label:
                    b['ris']=text
                    b['citation']=text
                    break
    for d in bib_data:
        db[settings.MONGO_DATABASE]['citation%s' % (ts)].save(d)
    load_advanced_search(db,ts)
    return ts
def load_endnote_allfields(db,filenames,ts):
    filename= '%s/%s' % (settings.UPLOAD_DIR,filenames['allfields'])
    f1=open(filename,'r')
    bibs = f1.read().split('Reference Type:')
    del bibs[0]
    for bib in bibs:
        text= '%s%s' % ('Reference Type:',bib)
        bibfields=text.split('\n')#'\r\n')
        data={}
        lastfield=''
        for f in bibfields:
            if not f.strip() =='':
                current=f.replace(':','##z##',1).split('##z##')
                if len(current)==1:
                    data[lastfield]='%s %s' % (data[lastfield],current[0])
                else:
                    lastfield=current[0].replace(' ','')
                    data[lastfield]=current[1].strip()
        keys= data['Keywords'].split(';')
        keys= [x.strip() for x in keys]
        data['Keywords']=keys
        if not 'Title' in data:
            if 'ShortTitle' in data:
                data['Title']=data['ShortTitle']
            elif 'TitleofWork' in data:
                data['ShortTitle']=data['TitleofWork']
                data['Title']=data['TitleofWork']
        if 'Label' in data:
            try:
                data['Label']=int(data['Label'].strip())
            except:
                raise Exception("Endnote Label field must be Interger. Label Value: '%s'" % (data['Label']))
        if 'Year' in data:
            try:
                data['Year']=int(data['Year'].strip())
            except:
                pass
        if 'RecordNumber' in data:
            try:
                data['RecordNumber']=int(data['RecordNumber'].strip())
            except:
                pass
        db[settings.MONGO_DATABASE]['endnote%s' % (ts)].save(data)
    return ts 

def load_advanced_search(db,ts):
    blank={ "REF_NO":None,"Pubtype":None,"Entered_by":None,"Sitename":None,"perc_exot":None,
            "Country":None,"Year":None,"Latitude_S_edge":None,"Latitude_N_edge":None,"Longitude_E_edge":None,"Longitude_W_edge":None,
            "Parcels":None,"Min_Elev_m":None,"Max_Elev_m":None,"Area_hectares":None,"midlat":None,"midlon":None,"midelev":None,"Flora_definition":None,"Arbitrary":None,
            "Habitat":None,"Physiographic":None,"Political":None,"Preservetype":None,"Jurisdiction":None,"Bot_effort":None,"NO_Families":None,"NO_Genera":None,
            "NO_Species":None,"NO_Tot_Taxa":None,"NO_Indig_Spp":None,"Status":None,"shortstatus":None,"Proofing_notes":None,"State":[]}
    states={'BCL': 'BRITISH COLUMBIA', 'WA': 'WASHINGTON', 'ALB': 'ALBERTA', 'DE': 'DELAWARE', 'DC': 'DISTRICT/COLUMBIA', 'WI': 'WISCONSIN',
        'WV': 'WEST VIRGINIA', 'YUK': 'YUKON', 'HI': 'HAWAII', 'FL': 'FLORIDA', 'WY': 'WYOMING', 'NH': 'NEW HAMPSHIRE',
        'NJ': 'NEW JERSEY', 'NM': 'NEW MEXICO', 'TX': 'TEXAS', 'LA': 'LOUISIANA', 'NB': 'NEW BRUNSWICK', 'NC': 'NORTH CAROLINA', 'ND': 'NORTH DAKOTA',
        'NE': 'NEBRASKA', 'TN': 'TENNESSEE', 'NY': 'NEW YORK', 'PA': 'PENNSYLVANIA', 'SPM': 'SAINT PIERRE ET MIQUELON', 'SAS': 'SASKATCHEWAN', 'NS': 'NOVA SCOTIA',
        'CA': 'CALIFORNIA', 'NV': 'NEVADA', 'PEI': 'PRINCE EDWARD ISLAND', 'VA': 'VIRGINIA', 'CO': 'COLORADO', 'AK': 'ALASKA', 'NFL': 'NEWFOUNDLAND', 'AL': 'ALABAMA',
        'AR': 'ARKANSAS', 'VT': 'VERMONT', 'IL': 'ILLINOIS', 'GA': 'GEORGIA', 'IN': 'INDIANA', 'IA': 'IOWA', 'OK': 'OKLAHOMA', 'AZ': 'ARIZONA', 'ID': 'IDAHO',
        'CT': 'CONNECTICUT', 'ME': 'MAINE', 'MD': 'MARYLAND', 'MA': 'MASSACHUSETTS', 'OH': 'OHIO', 'UT': 'UTAH', 'MO': 'MISSOURI', 'MN': 'MINNESOTA', 'MI': 'MICHIGAN',
        'RI': 'RHODE ISLAND', 'KS': 'KANSAS', 'MT': 'MONTANA', 'NWT': 'NORTHWEST TERRITORIES', 'QUE': 'QUEBEC', 'ONT': 'ONTARIO', 'MS': 'MISSISSIPPI',
        'SC': 'SOUTH CAROLINA', 'KY': 'KENTUCKY', 'MAN': 'MANITOBA', 'OR': 'OREGON', 'SD': 'SOUTH DAKOTA','NFL':'LABRADOR'}
    for row in db[settings.MONGO_DATABASE]['endnote%s' % (ts)].find():
        res=db[settings.MONGO_DATABASE]['data%s' % (ts)].find({"REF_NO":{"$gte":row['Label'],"$lt":row['Label'] + 1}})
        if res.count()>0:
            for data in res:
                temp=row
                temp.update(data)
                temp.pop('_id')
                db[settings.MONGO_DATABASE]['adv_search%s' % (ts)].insert(temp)
        else:
            temp = row
            blank1=blank
            try:
                blank1['Year']=row['Year']
            except:
                blank1['Year']=None
            temp.update(blank1)
            temp.pop('_id')
            st=[]
            #Set Pubtype
            if temp['ReferenceType'] == "Journal Article" or temp['ReferenceType'] =="Electronic Article":
                temp['Pubtype']= "article"
            if temp['ReferenceType'] == "Book" or temp['ReferenceType'] =="Electronic Book":
                temp['Pubtype']= "book"
            if temp['ReferenceType'] == "Thesis":
                temp['Pubtype']= "thesis"
            if temp['ReferenceType'] =="Unpublished Work":
                temp['Pubtype']= "unpublished"
            if temp['ReferenceType'] =="Book Section":
                temp['Pubtype']= "chapter"
            if temp['ReferenceType'] =="Web Page":
                temp['Pubtype']= "internet resource"
            #Set States
            for key in temp['Keywords']:
                for k,v in states.items():
                    if key.strip().upper() == v.strip().upper():
                        st.append(k)
            temp['State']=st
            #insert
            db[settings.MONGO_DATABASE]['adv_search%s' % (ts)].insert(temp)
