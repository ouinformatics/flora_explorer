### Flora Explorer ###
=============

Flora web app and dynamic florabib django web application.

### Installation ###
The following installation instructions assume a Linux Centos OS and Apache Web Server with Python WSGI module installed. Python virtual environment is also very useful when deploying python application.
 * Database 
    * MongoDB 
        [Mongo DB Installation](http://docs.mongodb.org/manual/installation/)
 * Web Applications 
    * Mongo Cybercommons Web API Applicatiion
        [Mongo Web API](https://github.com/ouinformatics/cybercom)
        <pre>
            #Install pip and virtualenv
            $ easy_install pip
            $ pip install virtualenv

            #Create apps directory 
            $ mkdir -p /var/www/apps/mongo/
            $ cd /var/www/apps/mongo/

            #Create python virtual environment
            $ virtualenv virtpy/
            $ source virtpy/bin/activate
            $ pip install https://github.com/ouinformatics/cybercom/tarball/master
        </pre> 
    * Flora and Florabib Applications
        [Flora Explorer](https://github.com/ouinformatics/flora_explorer)   
