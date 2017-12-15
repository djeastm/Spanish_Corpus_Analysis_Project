import Dexie from "Dexie";
import IDBExportImport from "indexeddb-export-import";

var corpus;
var request_corpus = new XMLHttpRequest();

var db = new Dexie("PRESEEA");

db.version(1).stores({
    texts: "++id, text, Datos_Corpus_pais,Hablantes_Relaciones_rel_ent_aud1,Hablantes_Hablante_1_codigo_hab,Hablantes_Hablante_0_edad,Hablantes_Hablante_0_nombre,Datos_Grabacion_resp_grab,Hablantes_Hablante_0_estudios,Hablantes_Hablante_1_sexo,Hablantes_Hablante_0_papel,Datos_Transcripcion_numero_palabras,Datos_Revision_0_num_rev,Hablantes_Relaciones_rel_inf_aud2,Datos_Revision_1_resp_rev,Datos_clave_texto,Hablantes_Hablante_1_papel,Datos_Grabacion_duracion,Hablantes_Hablante_0_codigo_hab,Hablantes_Hablante_0_origen,Hablantes_Hablante_0_nivel_edu,Datos_Corpus_ciudad,Hablantes_Relaciones_rel_ent_aud2,Datos_Revision_0_fecha_rev,Datos_Revision_1_num_rev,Datos_tipo_texto,Datos_Grabacion_sistema,Hablantes_Relaciones_rel_inf_aud1,Datos_Revision_0_resp_rev,Datos_Revision_1_fecha_rev,xml_lang,Hablantes_Hablante_1_edad,Hablantes_Hablante_0_sexo,Hablantes_Relaciones_rel_ent_inf,Datos_Transcripcion_resp_trans,Datos_Corpus_subcorpus,Hablantes_Hablante_0_grupo_edad,Datos_Grabacion_lugar,Hablantes_Hablante_1_id,Hablantes_Hablante_1_nombre,Datos_Transcripcion_fecha_trans,audio_filename,Hablantes_Hablante_1_estudios,Hablantes_Hablante_1_origen,Hablantes_Hablante_1_grupo_edad,Hablantes_Hablante_0_profesion,Hablantes_Hablante_1_profesion,Datos_Grabacion_fecha_grab,Datos_Corpus_corpus,Hablantes_Hablante_1_nivel_edu,Hablantes_Hablante_0_id,Hablantes_Hablante_2_origen,Hablantes_Hablante_2_codigo_hab,Hablantes_Hablante_2_sexo,Hablantes_Hablante_2_estudios,Hablantes_Hablante_2_grupo_edad,Hablantes_Hablante_2_profesion,Hablantes_Hablante_2_papel,Hablantes_Hablante_2_nombre,Hablantes_Hablante_2_nivel_edu,Hablantes_Hablante_2_id,Hablantes_Hablante_2_edad,Hablantes_text,Hablantes_Hablante_0_profesión,Datos_Revision_2_fecha_rev,Datos_Revision_2_num_rev,Datos_Revision_2_resp_rev,Datos_Grabacion_duración,Datos_Revision_4_num_rev,Datos_Revision_4_fecha_rev,Datos_Revision_3_fecha_rev,Datos_Revision_3_resp_rev,Datos_Revision_3_num_rev,Datos_Revision_4_resp_rev,Hablantes_Hablante_9_id,Hablantes_Hablante_7_estudios,Hablantes_Hablante_3_papel,Hablantes_Hablante_6_estudios,Hablantes_Hablante_6_codigo_hab,Hablantes_Hablante_12_nivel_edu,Hablantes_Hablante_13_edad,Hablantes_Hablante_6_nombre,Hablantes_Hablante_7_edad,Hablantes_Hablante_10_nombre,Hablantes_Hablante_3_estudios,Hablantes_Hablante_14_estudios,Hablantes_Hablante_4_grupo_edad,Hablantes_Hablante_4_edad,Hablantes_Hablante_12_edad,Hablantes_Hablante_4_papel,Hablantes_Hablante_5_profesion,Hablantes_Hablante_5_origen,Hablantes_Hablante_13_grupo_edad,Hablantes_Hablante_14_sexo,Hablantes_Hablante_9_nombre,Hablantes_Hablante_13_nombre,Hablantes_Hablante_3_origen,Hablantes_Hablante_7_nivel_edu,Hablantes_Hablante_11_papel,Hablantes_Hablante_8_estudios,Hablantes_Hablante_4_estudios,Hablantes_Hablante_9_papel,Hablantes_Hablante_12_nombre,Hablantes_Hablante_12_id,Hablantes_Hablante_5_estudios,Hablantes_Hablante_5_codigo_hab,Hablantes_Hablante_3_sexo,Hablantes_Hablante_8_papel,Hablantes_Hablante_6_id,Hablantes_Hablante_7_origen,Hablantes_Hablante_8_sexo,Hablantes_Hablante_13_papel,Hablantes_Hablante_3_edad,Hablantes_Hablante_11_codigo_hab,Hablantes_Hablante_7_papel,Hablantes_Hablante_13_estudios,Hablantes_Hablante_11_sexo,Hablantes_Hablante_10_codigo_hab,Hablantes_Hablante_10_estudios,Hablantes_Hablante_4_codigo_hab,Hablantes_Hablante_3_grupo_edad,Hablantes_Hablante_8_id,Hablantes_Hablante_11_origen,Hablantes_Hablante_12_grupo_edad,Hablantes_Hablante_5_nombre,Hablantes_Hablante_13_id,Hablantes_Hablante_11_nombre,Hablantes_Hablante_3_nombre,Hablantes_Hablante_13_codigo_hab,Hablantes_Hablante_9_grupo_edad,Hablantes_Hablante_4_id,Hablantes_Hablante_11_nivel_edu,Hablantes_Hablante_4_nombre,Hablantes_Hablante_8_profesion,Hablantes_Hablante_9_edad,Hablantes_Hablante_8_codigo_hab,Hablantes_Hablante_11_estudios,Hablantes_Hablante_11_profesion,Hablantes_Hablante_9_origen,Hablantes_Hablante_5_nivel_edu,Hablantes_Hablante_6_papel,Hablantes_Hablante_5_grupo_edad,Hablantes_Hablante_14_grupo_edad,Hablantes_Hablante_13_origen,Hablantes_Hablante_5_sexo,Hablantes_Hablante_3_codigo_hab,Hablantes_Hablante_9_profesion,Hablantes_Hablante_6_grupo_edad,Hablantes_Hablante_3_id,Hablantes_Hablante_14_profesion,Hablantes_Hablante_13_sexo,Hablantes_Hablante_3_nivel_edu,Hablantes_Hablante_10_nivel_edu,Hablantes_Hablante_5_id,Hablantes_Hablante_9_nivel_edu,Hablantes_Hablante_5_papel,Hablantes_Hablante_10_grupo_edad,Hablantes_Hablante_10_sexo,Hablantes_Hablante_14_nivel_edu,Hablantes_Hablante_14_origen,Hablantes_Hablante_7_codigo_hab,Hablantes_Hablante_3_profesion,Hablantes_Hablante_6_origen,Hablantes_Hablante_6_edad,Hablantes_Hablante_13_nivel_edu,Hablantes_Hablante_12_papel,Hablantes_Hablante_9_estudios,Hablantes_Hablante_7_sexo,Hablantes_Hablante_6_nivel_edu,Hablantes_Hablante_6_profesion,Hablantes_Hablante_4_sexo,Hablantes_Hablante_12_codigo_hab,Hablantes_Hablante_7_grupo_edad,Hablantes_Hablante_11_id,Hablantes_Hablante_14_papel,Hablantes_Hablante_14_id,Hablantes_Hablante_14_nombre,Hablantes_Hablante_6_sexo,Hablantes_Hablante_14_edad,Hablantes_Hablante_8_nivel_edu,Hablantes_Hablante_8_nombre,Hablantes_Hablante_10_papel,Hablantes_Hablante_9_sexo,Hablantes_Hablante_14_codigo_hab,Hablantes_Hablante_12_estudios,Hablantes_Hablante_11_grupo_edad,Hablantes_Hablante_10_edad,Hablantes_Hablante_11_edad,Hablantes_Hablante_8_edad,Hablantes_Hablante_9_codigo_hab,Hablantes_Hablante_8_origen,Hablantes_Hablante_5_edad,Hablantes_Hablante_4_origen,Hablantes_Hablante_7_nombre,Hablantes_Hablante_4_nivel_edu,Hablantes_Hablante_4_profesion,Hablantes_Hablante_10_id,Hablantes_Hablante_12_origen,Hablantes_Hablante_12_profesion,Hablantes_Hablante_10_origen,Hablantes_Hablante_13_profesion,Hablantes_Hablante_7_id,Hablantes_Hablante_8_grupo_edad,Hablantes_Hablante_12_sexo,Hablantes_Hablante_10_profesion,Hablantes_Hablante_7_profesion,Hablantes_Relaciones_rel_ent_aud3,Hablantes_Relaciones_rel_inf_aud3,Hablantes_Relaciones_rel_ent_inf2,Hablantes_Relaciones_rel_inf_inf2,Hablantes_Relaciones_rel_inf_aud4,Hablantes_Relaciones_rel_ent_aud4,Hablantes_Hablante_1_profesión,Hablantes_Hablante_1_código_hab"
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


    db.texts.get(15).then(function(t) {
        var text_div = document.createElement("text");
        var text_head = document.createElement("texthead");
        var text_body = document.createElement("textbody");

        //Header/Metadata
        // header_html = ''
        console.log(t);
        //var metaclass = "Hablantes_Relaciones_rel_ent_inf"
        var metaclasses = Object.keys(t).sort();
        for (var i = 0; i < metaclasses.length; i++)            
            if (metaclasses[i] !== "text") text_head.appendChild(getHeaderMetaclass(t, metaclasses[i]));

        text_div.appendChild(text_head);

        //Body
        text_body.innerHTML = t.text;
        text_div.appendChild(text_body);

        corpus_html.appendChild(text_div);
    });
}

function getHeaderMetaclass(t, metaclass) {
    var metaclassName = metaclass.toLowerCase();    
    var text_head_meta = document.createElement("div");
    text_head_meta.setAttribute('metaclass', metaclassName);
    text_head_meta.innerHTML = metaclass + ": " + t[metaclass];
    return text_head_meta;

}