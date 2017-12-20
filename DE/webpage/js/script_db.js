import Dexie from "Dexie";
import IDBExportImport from "indexeddb-export-import";

var request_corpus_cordial = new XMLHttpRequest();
var request_corpus_corlec = new XMLHttpRequest();
var request_corpus_preseea = new XMLHttpRequest();
var request_corpus_cdelesp = new XMLHttpRequest();

export var db = new Dexie("corpus_db");

db.version(1).stores({
    preseea: "++id, text",
    cordial: "++id, text",
    corlec: "++id, text",
    cdelesp: "++id, text"
});

db.on("populate", function() {
    console.log("Request Corpus");
    var requestURL_corpus_cordial = 'corpus_cordial.json';
    request_corpus_cordial.open('GET', requestURL_corpus_cordial);
    request_corpus_cordial.responseType = 'json';
    request_corpus_cordial.send();

    var requestURL_corpus_corlec = 'corpus_corlec.json';
    request_corpus_corlec.open('GET', requestURL_corpus_corlec);
    request_corpus_corlec.responseType = 'json';
    request_corpus_corlec.send();

    var requestURL_corpus_preseea = 'corpus_preseea.json';
    request_corpus_preseea.open('GET', requestURL_corpus_preseea);
    request_corpus_preseea.responseType = 'json';
    request_corpus_preseea.send();

    var requestURL_corpus_cdelesp = 'corpus_cdelesp.json';
    request_corpus_cdelesp.open('GET', requestURL_corpus_cdelesp);
    request_corpus_cdelesp.responseType = 'json';
    request_corpus_cdelesp.send();

});

request_corpus_cordial.onreadystatechange = function() {
    if (request_corpus_cordial.readyState === 4) {        
        var corpus = request_corpus_cordial.response; 
        importCorpus("cordial", corpus);       
    }
}

request_corpus_corlec.onreadystatechange = function() {
    if (request_corpus_corlec.readyState === 4) {        
        var corpus = request_corpus_corlec.response; 
        importCorpus("corlec", corpus);       
    }
}

request_corpus_preseea.onreadystatechange = function() {
    if (request_corpus_preseea.readyState === 4) {        
        var corpus = request_corpus_preseea.response; 
        importCorpus("preseea", corpus);  
    }
}

request_corpus_cdelesp.onreadystatechange = function() {
    if (request_corpus_cdelesp.readyState === 4) {        
        var corpus = request_corpus_cdelesp.response; 
        importCorpus("cdelesp", corpus);  
    }
}

function importCorpus(corpus_name, corpus_json) {
    var idb_db = db.backendDB(); // get native IDBDatabase object from Dexie wrapper

    var jsonString = '{"'+corpus_name+'":' + JSON.stringify(corpus_json) + '}';
    IDBExportImport.importFromJsonString(idb_db, jsonString, function(err) {            
        if (!err)
            console.log("Imported "+corpus_name+" data successfully");
    });
}

db.open();
