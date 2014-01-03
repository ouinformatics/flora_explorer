db=db.getSiblingDB('{{ database }}');
db.data.drop();
db.data{{ ts }}.copyTo("data");
db.endnote.drop();
db.endnote{{ ts }}.copyTo("endnote");
db.citation.drop();
db.citation{{ ts }}.copyTo("citation");
db.adv_search.drop();
db.adv_search{{ ts }}.copyTo("adv_search");
