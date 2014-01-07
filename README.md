### Flora Explorer ###
=============

Flora web app and dynamic florabib django web application.

### Installation ###
The following installation instructions assume a Linux Centos OS and Apache Web Server with Python WSGI module installed. Python virtual environment is also very useful when deploying python application.
 * Database 
    * MongoDB 
        [Mongo DB Installation](http://docs.mongodb.org/manual/installation/)
 * Web Applications 
    * Mongo Cybercommons Web API Applicatiion (# are comments and $ is commands)
        [Mongo Web API](https://github.com/ouinformatics/cybercom)
        <pre>
            #Install pip and virtualenv
            $ sudo easy_install pip
            $ sudo pip install virtualenv

            #Create apps directory 
            $ mkdir -p /var/www/apps/mongo/
            $ cd /var/www/apps/mongo/

            #Create python virtual environment
            $ virtualenv virtpy/
            $ source virtpy/bin/activate

            #See help folder for requirements.txt
            $ pip install -r mongo-requirements.txt
            $ pip install pandas==0.7.3
    
            #Create wsgi file to install mod_wsgi application
            #See example_mongo.wsgi in help folder
        </pre> 
    * Flora and Florabib Applications
        [Flora Explorer](https://github.com/ouinformatics/flora_explorer)
        * Install Flora web html
            <pre>
                #cp flora directory into the html folder
                $ scp -r flora yourserver:/var/www/html/
                $ cd /var/www/html/flora/
                $ vi flora.js
                #Check variable floraBase, mongoBase, florabibBase base url locations
                #Defaults /flora , /mongo , /florabib 
            </pre>
        * Install Florabib application
            <pre>
                #Copy florabib directtory to apps folder
                $ cp -r florabib /var/www/apps/
                $ cd /var/www/apps/florabib/

                #Create python virtual environment
                $ virtualenv virtpy/
                $ source virtpy/bin/activate

                #See help folder for requirements.txt
                $ pip install -r requirements.txt

                #Use florabib.wsgi file for initializing mod_wsgi application
                #Within apache conf.d directory create florabib.conf
                #florabib.conf contains: WSGIScriptAlias /florabib /var/www/apps/florabib/florabib.wsgi
            
                #Initialize database for username and login
                # Remove existing database. 
                $ rm data/flora.db
                $ python mangage.py syncdb

                #restart apache httpd web server
                $ sudo service httpd restart

                #will ask for you to create superuser. Create superuser and password
                #User used for admin in django user administration. Login /florabib/admin/
                #Done with installation. 
            
            </pre>

 
        ### settings.py ###
        * Change the secret key - highly recommended since key was visible on github
        * Create UPLOAD_DIR and make sure apache user  has permisions to read write
        * LOGIN_URL should be correct unless you set up application with alternative url base directory
        
        ### Mongo database ###
        * use backup or upload procedure in florabib application to create data.
