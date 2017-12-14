import Dexie from "Dexie";
import IDBExportImport from "indexeddb-export-import";

var db = new Dexie("PRESEEA");
Dexie.debug = true;
// db.version(1).stores({
//     texts : "id++, Trans, text"
// });
db.version(1).stores({
    texts: "++id, Datos_Corpus_DE_ciudad,Datos_Corpus_DE_corpus,Datos_Corpus_DE_pais,Datos_Corpus_DE_subcorpus,Datos_DE_clave_texto,Datos_DE_tipo_texto,Datos_Grabacion_DE_duracion,Datos_Grabacion_DE_fecha_grab,Datos_Grabacion_DE_lugar,Datos_Grabacion_DE_resp_grab,Datos_Transcripcion_DE_numero_palabras,Datos_Transcripcion_DE_resp_trans,Hablantes_Hablante_0_DE_codigo_hab,Hablantes_Hablante_0_DE_edad,Hablantes_Hablante_0_DE_estudios,Hablantes_Hablante_0_DE_grupo_edad,Hablantes_Hablante_0_DE_id,Hablantes_Hablante_0_DE_nivel_edu,Hablantes_Hablante_0_DE_origen,Hablantes_Hablante_0_DE_papel,Hablantes_Hablante_0_DE_profesion,Hablantes_Hablante_0_DE_sexo,Hablantes_Hablante_1_DE_codigo_hab,Hablantes_Hablante_1_DE_edad,Hablantes_Hablante_1_DE_estudios,Hablantes_Hablante_1_DE_grupo_edad,Hablantes_Hablante_1_DE_id,Hablantes_Hablante_1_DE_nivel_edu,Hablantes_Hablante_1_DE_origen,Hablantes_Hablante_1_DE_papel,Hablantes_Hablante_1_DE_profesion,Hablantes_Hablante_1_DE_sexo,Hablantes_Relaciones_DE_rel_ent_aud1,Hablantes_Relaciones_DE_rel_ent_aud2,Hablantes_Relaciones_DE_rel_ent_inf,Hablantes_Relaciones_DE_rel_inf_aud1,Hablantes_Relaciones_DE_rel_inf_aud2"
});
// db.version(1).stores({
//     texts: "++id, Trans_Hablantes_Hablante_1_DE_papel,Trans_Datos_DE_tipo_texto,Trans_Datos_Transcripcion_DE_numero_palabras,Trans_Datos_Revision_1_DE_num_rev,Trans_Hablantes_Hablante_1_DE_grupo_edad,Trans_Hablantes_Hablante_1_DE_nombre,Trans_Datos_DE_clave_texto,Trans_Hablantes_Hablante_1_DE_profesion,Trans_Hablantes_Hablante_0_DE_estudios,Trans_Hablantes_Hablante_0_DE_papel,Trans_Hablantes_Hablante_0_DE_origen,Trans_Hablantes_Hablante_0_DE_sexo,Trans_Hablantes_Relaciones_DE_rel_inf_aud2,Trans_Hablantes_Relaciones_DE_rel_ent_aud2,Trans_Datos_Revision_0_DE_fecha_rev,Trans_Datos_Grabacion_DE_lugar,Trans_Datos_Revision_0_DE_num_rev,Trans_Datos_Revision_0_DE_resp_rev,Trans_Hablantes_Hablante_1_DE_nivel_edu,Trans_Hablantes_Hablante_1_DE_estudios,Trans_Hablantes_Hablante_1_DE_origen,Trans_Hablantes_Hablante_1_DE_sexo,Trans_Datos_Transcripcion_DE_fecha_trans,Trans_Datos_Grabacion_DE_resp_grab,Trans_Datos_Revision_1_DE_fecha_rev,Trans_Hablantes_Hablante_0_DE_nivel_edu,Trans_Hablantes_Hablante_0_DE_edad,Trans_Datos_Revision_1_DE_resp_rev,Trans_Datos_Transcripcion_DE_resp_trans,Trans_Hablantes_Relaciones_DE_rel_ent_inf,Trans_Hablantes_Hablante_0_DE_profesion,Trans_Datos_Grabacion_DE_sistema,Trans_DE_xml:lang,Trans_Datos_Corpus_DE_subcorpus,Trans_Hablantes_Hablante_0_DE_codigo_hab,Trans_Datos_Corpus_DE_ciudad,Trans_Hablantes_Hablante_0_DE_grupo_edad,Trans_Hablantes_Hablante_1_DE_edad,Trans_Hablantes_Relaciones_DE_rel_inf_aud1,Trans_Hablantes_Hablante_0_DE_nombre,Trans_Hablantes_Relaciones_DE_rel_ent_aud1,Trans_Datos_Grabacion_DE_duracion,Trans_Hablantes_Hablante_1_DE_codigo_hab,Trans_DE_audio_filename,Trans_Hablantes_Hablante_0_DE_id,Trans_Datos_Corpus_DE_corpus,Trans_Datos_Corpus_DE_pais,Trans_Datos_Grabacion_DE_fecha_grab,Trans_Hablantes_Hablante_1_DE_id"
// });


db.on("ready", function() {
    console.log("Hi:");
    var idb_db = db.backendDB(); // get native IDBDatabase object from Dexie wrapper

    // export to JSON, clear database, and import from JSON
    IDBExportImport.exportToJsonString(idb_db, function(err, jsonString) {
        if(err)
            console.error(err);
        else {
            // console.log("Exported as JSON: " + jsonString);
            jsonString = '{"texts":[{"Hablantes_Hablante_1_DE_nivel_edu": "alto", "Hablantes_Relaciones_DE_rel_ent_inf": "desconocidos", "Datos_Transcripcion_DE_resp_trans": "Equipo de Alcal\u00e1", "Hablantes_Hablante_0_DE_nivel_edu": "bajo", "Datos_Revision_0_DE_resp_rev": "responsable", "Hablantes_Hablante_1_DE_papel": "entrevistador", "Hablantes_Hablante_1_DE_profesion": "profesor", "Datos_Corpus_DE_pais": "Espa\u00f1a", "Datos_Revision_1_DE_resp_rev": "responsable", "Hablantes_Hablante_0_DE_estudios": "graduado escolar", "DE_audio_filename": "ALCA_H11_037.mp3", "Hablantes_Relaciones_DE_rel_ent_aud1": "no", "Hablantes_Hablante_1_DE_grupo_edad": "2", "Hablantes_Hablante_0_DE_profesion": "dependiente de comercio", "Datos_Corpus_DE_corpus": "PRESEEA", "Datos_Revision_0_DE_fecha_rev": "aaaa-mm-dd", "Hablantes_Hablante_1_DE_edad": "desc", "Hablantes_Relaciones_DE_rel_inf_aud1": "no", "Datos_DE_clave_texto": "ALCA_H11_037", "Datos_DE_tipo_texto": "entrevista_semidirigida", "Datos_Grabacion_DE_resp_grab": "Equipo de Alcal\u00e1", "Hablantes_Hablante_1_DE_nombre": "Florentino Paredes", "Hablantes_Hablante_1_DE_origen": "desc", "Hablantes_Hablante_1_DE_estudios": "filolog\u00eda", "Datos_Grabacion_DE_duracion": "5000", "Hablantes_Hablante_0_DE_origen": "Guadalajara", "Datos_Transcripcion_DE_numero_palabras": "10684", "Hablantes_Hablante_0_DE_edad": "33", "Datos_Grabacion_DE_fecha_grab": "1998-06-25", "Hablantes_Relaciones_DE_rel_ent_aud2": "no", "Hablantes_Relaciones_DE_rel_inf_aud2": "no", "Hablantes_Hablante_0_DE_id": "hab1", "Hablantes_Hablante_0_DE_codigo_hab": "I", "Hablantes_Hablante_0_DE_nombre": " ALCA_H11_037", "Datos_Grabacion_DE_lugar": "desc", "Hablantes_Hablante_0_DE_grupo_edad": "1", "Hablantes_Hablante_1_DE_id": "hab2", "Datos_Revision_0_DE_num_rev": "1", "DE_xml:lang": "espa\u00f1ol", "Hablantes_Hablante_0_DE_papel": "informante", "Datos_Transcripcion_DE_fecha_trans": "2011-03-23", "Datos_Grabacion_DE_sistema": "MP3", "Hablantes_Hablante_1_DE_sexo": "hombre", "Datos_Revision_1_DE_fecha_rev": "aaaa-mm-dd", "Hablantes_Hablante_1_DE_codigo_hab": "E", "Datos_Corpus_DE_ciudad": "Alcal\u00e1 de Henares", "Hablantes_Hablante_0_DE_sexo": "hombre", "Datos_Revision_1_DE_num_rev": "2", "Datos_Corpus_DE_subcorpus": "Alcal\u00e1"}]}';
            //console.log("String: " + jsonString);
            IDBExportImport.clearDatabase(idb_db, function(err) {                
                if(!err) // cleared data successfully                    
                    IDBExportImport.importFromJsonString(idb_db, jsonString, function(err) {
                        //console.log("Imported data: " + jsonString);
                        if (!err)
                            console.log("Imported data successfully");
                    });
            });
        }
    });
});
db.open();