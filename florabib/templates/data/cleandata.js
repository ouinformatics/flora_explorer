db=db.getSiblingDB('{{ database }}');
db.{{ collection }}.remove({REF_NO:""});
db.{{ collection }}.find().forEach(function(x){delete x[""]; db.{{ collection }}.save(x);});
db.{{ collection }}.find().forEach(function(x) { function isNull(element, index, array) { return (element != "");};x.State = [x.State1,x.State2,x.State3,x.State4,x.State5,x.State6,x.State7,x.State8]; x.State = x.State.filter(isNull); delete x.State1; delete x.State2; delete x.State3; delete x.State4; delete x.State5; delete x.State6; delete x.State7; delete x.State8; db.{{ collection }}.save(x);});

//double check Preservetype,Jurisdiction,Bot - effort
db.{{ collection }}.find().forEach( function(x) { if (x.Political==1){x.Political="State - Province";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Political==2){x.Political="County";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Political==3){x.Political="Preserve - Park";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Political==4){x.Political="Private";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Political==5){x.Political="Military";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==1){x.Preservetype="Park";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==2){x.Preservetype="Forest";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==3){x.Preservetype="Wildlife Management";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==4){x.Preservetype="Wilderness";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==5){x.Preservetype="Natural Area - NRA";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==6){x.Preservetype="Recreation";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==7){x.Preservetype="Mixed";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==8){x.Preservetype="National Monument";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==9){x.Preservetype="Experimental - Research";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==10){x.Preservetype="Botanical Area";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==11){x.Preservetype="Historical Site";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==13){x.Preservetype="Coservation Easement";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Preservetype==15){x.Preservetype="Wildlife Refuge";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Jurisdiction==1){x.Jurisdiction="Federal";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Jurisdiction==2){x.Jurisdiction="State - Province";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Jurisdiction==3){x.Jurisdiction="County";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Jurisdiction==4){x.Jurisdiction="City";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Jurisdiction==5){x.Jurisdiction="Private";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Bot_effort==2){x.Bot_effort="Herbaria - Searched";db.{{ collection }}.save(x);} });
db.{{ collection }}.find().forEach( function(x) { if (x.Bot_effort==1){x.Bot_effort="Herbaria - Not Searched";db.{{ collection }}.save(x);} });
