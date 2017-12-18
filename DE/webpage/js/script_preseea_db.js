import Dexie from "Dexie";
import IDBExportImport from "indexeddb-export-import";

var corpus;
var request_corpus = new XMLHttpRequest();

export var db = new Dexie("PRESEEA");

db.version(1).stores({
    texts: "++id, text"
});

db.on("populate", function() {
    console.log("Request Corpus");
    var requestURL_corpus = 'corpus_preseea.json';
    request_corpus.open('GET', requestURL_corpus);
    request_corpus.responseType = 'json';
    request_corpus.send();

});

db.on("ready", function() {
    getTexts();
});

request_corpus.onreadystatechange = function() {
    if (request_corpus.readyState === 4) {
        //console.log(request_corpus.response); //Outputs a DOMString by default
        corpus = request_corpus.response;
        //console.log(JSON.stringify(corpus));
        //console.log(corpus);
        var idb_db = db.backendDB(); // get native IDBDatabase object from Dexie wrapper

        var jsonString = '{"texts":' + JSON.stringify(corpus) + '}';
        IDBExportImport.importFromJsonString(idb_db, jsonString, function(err) {
            //console.log("Imported data: " + jsonString);
            if (!err)
                console.log("Imported data successfully");


        });
        // // export to JSON, clear database, and import from JSON
        // IDBExportImport.exportToJsonString(idb_db, function(err, jsonString) {
        //     if(err)
        //         console.error(err);
        //     else {

        //     // console.log("Exported as JSON: " + jsonString);

        //         //console.log("String: " + jsonString);
        //         IDBExportImport.clearDatabase(idb_db, function(err) {                
        //             if(!err) // cleared data successfully                    

        //         });
        //     }
        // });      
    }
}


db.open();

function getTexts() {
    var corpus_html = document.getElementById("corpus");


    // db.texts.get(15).then(function(t) {
    //     var text_div = document.createElement("text");
    //     var text_head = document.createElement("div");
    //     text_head.className = "texthead";
    //     var text_body = document.createElement("div");
    //     text_body.className = "textbody";

    //     var metaclasses = Object.keys(t).sort();
    //     for (var i = 0; i < metaclasses.length; i++)            
    //         if (metaclasses[i] !== "text") text_head.appendChild(getHeaderMetaclass(t, metaclasses[i]));

    //     text_div.appendChild(text_head);

    //     //Body
    //     text_body.innerHTML = t.text;
    //     text_div.appendChild(text_body);

    //     corpus_html.appendChild(text_div);
    // });
}

function getHeaderMetaclass(t, metaclass) {
    var metaclassName = metaclass.toLowerCase();    
    var text_head_meta = document.createElement("div");
    text_head_meta.setAttribute('metaclass', metaclassName);
    text_head_meta.innerHTML = metaclass + ": " + t[metaclass];
    return text_head_meta;

}