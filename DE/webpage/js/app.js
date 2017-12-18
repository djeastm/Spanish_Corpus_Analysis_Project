import { db } from './script_preseea_db';
console.log("db:" + db);

db.open().catch(function(e) {
    console.error("Open failed: " + e);
});

var tag = '';
var pos = '';
var backgroundColor = "white";
var group_by = "";

window.onload = showPage;
document.getElementById("form_submit").addEventListener("submit", function(e) { highlight(e); });
document.getElementById("POS").addEventListener("change", showHideSelects);
document.getElementById("export_button").addEventListener("click", exportFreqList);

// disable button until page loads completely

function showPage() {
    document.getElementById('highlight_button').disabled = false;
    document.getElementById("loader").style.display = "none";
    document.getElementById("corpus").style.display = "block";
}

function highlight(e) {
    clearHighlight(); // Turn off all previous highlighting

    pos = document.getElementById("POS").value;
    tag = pos;

    var selects = document.querySelectorAll("[type=\"" + pos + "\"]");

    // Build the tag (global) from each of the dropdown select boxes chosen by user
    for (var i = 0; i < selects.length; i++) {
        var ind = selects[i].selectedIndex;
        var val = selects[i].options[ind].value;
        if (val == "0") break;
        tag += val;
    }

    // Determine how/if the results will be grouped
    group_by = document.getElementById("group_by").value;            

    // Clear old search
    var corpus_html = document.getElementById("corpus");
    corpus_html.innerHTML = "";
    var wc_div = document.getElementById("word_count");
    wc_div.innerHTML = "";
    var freq_div = document.getElementById("frequencies");
    freq_div.innerHTML = "";
    

    // Go to database and get all the texts that contain these tags    
    tag = tag.replace(new RegExp("\\*", 'g'), "\.");    
    var words = [];
    db.transaction("r", db.texts, function() {
        return db.texts.each(t => {
            console.log("In transaction: " + t.id);

            var text = t.text;
            var text_length = text.length;

            var text_div = document.createElement("text");
            var text_head = document.createElement("div");
            text_head.className = "texthead";

            
            var tag_re = new RegExp("(<w t=\"" + tag + "\">(.*?)<\/w>)", "g");

            var substrs = [];
            var results_arr;
            var metaclasses = Object.keys(t).sort();
            var metagroup = [];
            

            var header_html = document.createElement("div");
            header_html.id = t.id;
            header_html.setAttribute('style', "height:200px; overflow:auto");
            var text_id = document.createElement("h2");
            text_id.innerHTML = "Text " + t.id;
            header_html.appendChild(text_id);
            
            for (var i = 0; i < metaclasses.length; i++) {
                if (metaclasses[i] !== "text") {           
                    var header_metaclass = getHeaderMetaclass(t, metaclasses[i]);  
                    header_html.appendChild(header_metaclass);                       
                    // Store metaclasses for analysis
                    if (metaclasses[i].endsWith(groupings_metaclass[group_by])) metagroup.push(header_metaclass);
                }
            }


            var open_full_text_button = document.createElement("button");
            open_full_text_button.innerText = "Text "+t.id;
            open_full_text_button.id = "openText";
            open_full_text_button.addEventListener('click', function() {
                openText(t.id, header_html.innerHTML, t.text , tag);
            });     

            // text_head.appendChild(open_full_text_button);
            text_div.appendChild(open_full_text_button);
            // text_div.appendChild(header_html);
            
            corpus_html.appendChild(text_div);       

            while ((results_arr = tag_re.exec(text)) !== null) {
                
                var tagged_word = results_arr[0];
                var word = results_arr[2].trim();
                
                words.push([metagroup,word]); // store metagroup and original word for analysis                          
            }               
        });
    }).then(() => {
        // Words have been populated so analyze them
        console.log("Transaction completed")

        // Get total word count
        var count = words.length;        

        // Determine how many of each grouping, or of total, if no grouping
        var limit = document.getElementById("limit").value;
        if (!Number.isInteger(limit) || limit <= 0) limit = 10; // quick validation and handling
        //console.log(group_by);
        var freq_html;
        if (group_by == "0") {
            var freq_dict = {};
            words.forEach(function(currVal, currIndex, listObj) {
                // Get the word itself
                // var word = currVal.innerHTML.trim();
                var word = currVal[1];

                // Count the frequencies of each word
                if (freq_dict[word]) {
                    freq_dict[word] = freq_dict[word] ? freq_dict[word] + 1 : 1;
                } else {
                    // If the word isn't already in our dictionary, create a new spot for it with its frequency                
                    freq_dict[word] = 1;
                }
            });

            freq_html = buildFreqList(freq_dict, count, limit);
        } else if (group_by == "1") {
            // the groupBy function will take care of building the html grouped by whatever grouping metaclass
            // we choose
            freq_html = groupBy("situation", words, limit, false);
        } // The following are CORLEC-specific
        else if (group_by == "2") {
            freq_html = groupBy("fuente", words, limit, false);
        } else if (group_by == "3") {
            freq_html = groupBy("terminos", words, limit, true);
        } // The following are C-Or-DiAL-specific
        else if (group_by == "4") {
            freq_html = groupBy("usos", words, limit, false);
        } else if (group_by == "5") {
            freq_html = groupBy("funciones", words, limit, true);
        } else { // TODO: change all corpuses to act the same
            freq_html = groupBy(group_by, words, limit, false);
        }

        // Update HTML with new data
        wc_div.innerHTML = count;
        freq_div.innerHTML = freq_html;

        document.getElementById('export_button').disabled = false;
        

        return false; // prevent further bubbling of event
    }).catch(function(error) {
        console.log("Database transaction error");
        console.log(error);
    });
    e.preventDefault(); // disable normal form submit behavior
}

function getHeaderMetaclass(t, metaclass) {
    var metaclassName = metaclass.toLowerCase();
    var text_head_meta = document.createElement("div");
    text_head_meta.setAttribute('metaclass', metaclassName);
    text_head_meta.innerHTML = "<b>"+metaclass+"</b>: " + t[metaclass];
    return text_head_meta;
}

function openText(id, header, text, tag) {
    sessionStorage.setItem("id", id); 
    sessionStorage.setItem("header", header); 

    sessionStorage.setItem("text", text); 
    sessionStorage.setItem("tag", tag); 
    
    window.open("text.html");
}


function clearHighlight() {
    var words = document.querySelectorAll("w");
    for (var i = 0; i < words.length; i++) {
        words[i].style.backgroundColor = backgroundColor;
    };
}

var groupings_metaclass = {
    "situation": "situación",
    "fuente": "fuente",//CORLEC
    "terminos": "términos",
    "usos": "uso_didáctico",//C-Or-DiAL
    "funciones": "funciones_comunicativas",
    "ciudad": "ciudad", // PRESEEA
    "pais": "pais",
    "tipo_de_texto": "tipo_texto",
    "sexo": "sexo",
    "grupo_edad": "grupo_edad",
    "estudios": "estudios",
    "profesion": "profesion",
    "nivel_edu": "nivel_edu",
    "origen": "origen",
    "codigo_hab":"codigo_hab"
};

// Takes in the group_by criterion, the words themselves, the limit on the number of results, and whether 
// the particular criterion has multiple elements that need to be parsed
function groupBy(group_by, words, limit, multiple) {

    // Find out what groupings are involved using these parts of speech
    var groupings = {};
    words.forEach(function(currVal, currIndex, listObj) {
        // Get the word itself
        // var word = currVal.innerHTML.trim();
        var word = currVal[1];

        // Get the grouping described in the metadata for this word

        var meta_grouping = currVal[0] // array of div elements
        for (var i = 0; i < meta_grouping.length; i++) {
            var grouping = "";
            if (meta_grouping[i] != null) grouping = meta_grouping[i].innerHTML.split(":")[1].trim();

            // If there are multiple parts to this grouping criterion, separated by commas,
            // split them up and iterate over them
            if (multiple) {
                parts = grouping.split(",");
                for (var j = 0; j < parts.length; j++) {
                    groupings = countFreqForWord(word, groupings, parts[j]);
                }
            } else {
                groupings = countFreqForWord(word, groupings, grouping);
            }
        }
    });

    // Sort descending by the groupings with the most words
    var groupingsSorted = Object.keys(groupings).sort(function(a, b) { return -(groupings[a].sit_count - groupings[b].sit_count); });

    var group_html = "";
    for (var i = 0; i < groupingsSorted.length; i++) {
        var grouping = groupingsSorted[i];
        group_html += "<h3>" + grouping + " (" + groupings[grouping].sit_count + " matches)" + "</h3><br>"
        var freq_list_i = buildFreqList(groupings[grouping].freq_dict,
            groupings[grouping].sit_count,
            limit);
        group_html += freq_list_i;
        group_html += "<br>";
    };

    return group_html;
}

function exportFreqList() {
    var freq_html = document.getElementById("frequencies").innerHTML;
    var csvContent = "";

    // Parse this to make a flat data file
    var lines = freq_html.split("<br>");
    var group = "";
    var group_head = "";
    for (var i = 0; i < lines.length; i++) {
        if (lines[i] === "") {
            continue;
        }
        // Header lines        
        if (lines[i].startsWith("<h3>")) {
            // Store previous group, if it exists;
            csvContent += group;
            group = "";

            var re = /<h3>(.*)\((\d+) matches\)<\/h3>/;
            var re_array = re.exec(lines[i]);
            group_head = "\"" + re_array[1].trim() + "\"," + re_array[2].trim() + ",";
        } else {
            var re = /(.*) : (\d+) \((.*)%\)/;
            var re_array = re.exec(lines[i]);
            if (group_head === "") {
                group += re_array[1].trim() + "," +
                    re_array[2].trim() + "," +
                    re_array[3].trim() + "\n";
            } else {
                group += re_array[1].trim() + "," +
                    re_array[2].trim() + "," +
                    re_array[3].trim() + "," +
                    group_head + "\n";
            }
        }
    }
    csvContent += group; // Save previous group one final time

    var blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    var filename = "export.csv";
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style = "visibility:hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

function countFreqForWord(word, groupings, grouping) {
    // Count the frequencies of each word contained in each grouping
    if (groupings[grouping]) {
        groupings[grouping].sit_count += 1;
        groupings[grouping].freq_dict[word] = groupings[grouping].freq_dict[word] ?
            groupings[grouping].freq_dict[word] + 1 : 1;
    } else {
        // If the grouping isn't already in our dictionary, create a new spot for it, along with its own
        // frequency dictionary
        var frequencies = {};
        frequencies[word] = 1;
        groupings[grouping] = { sit_count: 1, freq_dict: frequencies };
    }
    return groupings;
}

function buildFreqList(freq_dict, sit_count, limit) {

    // Sort to get the highest count at top
    var keysSorted = Object.keys(freq_dict).sort(function(a, b) { return -(freq_dict[a] - freq_dict[b]); });

    // Push the sorted keys into an array along with their values from the frequencies object
    var freqSorted = [];
    for (var j = 0; j < keysSorted.length; j++) {
        var key = keysSorted[j];
        var value = freq_dict[key];
        var pair = {};
        pair[key] = value;
        freqSorted.push(pair);
    }

    var freq_html = "";
    // Build HTML for each word frequency in the list, along with a percentage of the count that word comprises 
    for (var j = 0; j < freqSorted.length; j++) {
        if (j == limit - 1) break; // only take top results up to limit chosen by user
        var percent = (100 * Object.values(freqSorted[j])[0] / sit_count).toFixed(2);
        freq_html += Object.keys(freqSorted[j])[0] + " : " + Object.values(freqSorted[j])[0] + " (" + percent + "%) <br>";
    }

    return freq_html;
}


function showHideSelects() {
    pos = document.getElementById("POS").value;

    // Make this type select boxes visible and hide other types
    var selects = document.querySelectorAll("select, label");
    for (var i = 0; i < selects.length; i++) {
        selects[i].style.display = "none";
    };

    var selects = document.querySelectorAll("[class=\"" + pos + "\"]");
    for (var i = 0; i < selects.length; i++) {
        selects[i].style.display = "inline-block";
    };

    document.getElementById("POS").style.display = "inline-block"
    document.getElementById("POSLabel").style.display = "inline-block"
}