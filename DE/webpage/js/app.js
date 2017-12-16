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

    // Highlight the words 
    // var words = highlightTaggedWords();
    var corpus_html = document.getElementById("corpus");

    // Go to database and get all the texts that contain these tags    
    // tag = tag.replace(new RegExp("\\*", 'g'), "\.");
    tag = "DP2CSS";
    db.transaction("r", db.texts, function() {
        return db.texts.limit(2).each(t => {
            console.log("In transaction: " + t.id);
            //getWordsFromDB(t);
            console.log("t: " + t);
            var text = t.text;
            var text_length = text.length;

            var text_div = document.createElement("text");
            var text_head = document.createElement("div");
            text_head.className = "texthead";
            var text_substrs = document.createElement("div");
            text_substrs.className = "textsubstrs";
            var text_body = document.createElement("div");
            text_body.className = "textbody";

            // Head
            var metaclasses = Object.keys(t).sort();
            for (var i = 0; i < metaclasses.length; i++)
                if (metaclasses[i] !== "text") text_head.appendChild(getHeaderMetaclass(t, metaclasses[i]));

            text_div.appendChild(text_head);

            // Substr

            var tag_re = new RegExp("(<w t=\"" + tag + "\">.*?<\/w>)", "g");

            var substrs = [];
            var results_arr;
            while ((results_arr = tag_re.exec(text)) !== null) {
                var msg = "Found " + results_arr[0] + ".  ";
                msg += "Next match starts at " + tag_re.lastIndex;
                //console.log(msg);
                var start_ind = tag_re.lastIndex - 100;

                // Start the substring at the furthest left possible
                // and go as far right as possible (keeping the total less than 200 chars)
                if (start_ind < 0) start_ind = 0;
                var end_ind = start_ind + 200;
                if (end_ind >= text_length) end_ind = text_length - 1;

                // Prune off partial tags and words
                var substr_raw = text.substring(start_ind, end_ind);
                var substr_re = new RegExp("(<w.*\/w>)");
                var substr = substr_raw.match(substr_re);

                substrs.push([results_arr[0], substr[0]]);
            }

            var substr_html = "";
            for (var i = 0; i < substrs.length; i++) {
                substr_html += "<b>" + substrs[i][0] + "</b> : " + substrs[i][1].replace(new RegExp("<br>", 'g'), "") + "<br>";
            }
            text_substrs.innerHTML = substr_html;
            text_div.appendChild(text_substrs);

            // Body
            text_body.innerHTML = t.text;
            text_div.appendChild(text_body);

            corpus_html.appendChild(text_div);
            console.log("Hi: " + t.id);

        });
    }).then(() => {
        console.log("Transaction completed")
        var words = highlightTaggedWords();
        console.log(words);


        // Get total word count
        var count = words.length;

        // Determine how/if the results will be grouped
        group_by = document.getElementById("group_by").value;

        // Determine how many of each grouping, or of total, if no grouping
        var limit = document.getElementById("limit").value;
        if (!Number.isInteger(limit) || limit <= 0) limit = 10; // quick validation and handling

        var freq_html;
        if (group_by == "0") {
            var freq_dict = {};
            words.forEach(function(currVal, currIndex, listObj) {
                // Get the word itself
                var word = currVal.innerHTML.trim();

                // Count the frequencies of each word
                if (freq_dict[word]) {
                    freq_dict[word] = freq_dict[word] ? freq_dict[word] + 1 : 1;
                } else {
                    // If the word isn't already in our dictionary, create a new spot for it with its frequency                
                    freq_dict[word] = 1;
                }
            });

            freq_html = buildFreqList(freq_dict, count, limit);
        } else if (group_by == "S") {
            // the groupBy function will take care of building the html grouped by whatever grouping metaclass
            // we choose
            freq_html = groupBy("situation", words, limit, false);
        } // The following are CORLEC-specific
        else if (group_by == "F") {
            freq_html = groupBy("fuente", words, limit, false);
        } else if (group_by == "T") {
            freq_html = groupBy("terminos", words, limit, true);
        } // The following are C-Or-DiAL-specific
        else if (group_by == "U") {
            freq_html = groupBy("usos", words, limit, false);
        } else if (group_by == "C") {
            freq_html = groupBy("funciones", words, limit, true);
        } else {

        }

        // Update HTML with new data
        document.getElementById("word_count").innerHTML = count;
        document.getElementById("frequencies").innerHTML = freq_html;

        document.getElementById('export_button').disabled = false;
        

        return false; // prevent further bubbling of event
    }).catch(function(error) {
        console.log("Database transaction error");
    });
    e.preventDefault(); // disable normal form submit behavior
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

// function getWordsFromDB(t) {

// }

function getHeaderMetaclass(t, metaclass) {
    var metaclassName = metaclass.toLowerCase();
    var text_head_meta = document.createElement("div");
    text_head_meta.setAttribute('metaclass', metaclassName);
    text_head_meta.innerHTML = metaclass + ": " + t[metaclass];
    return text_head_meta;

}

function highlightTaggedWords() {

    var pieces = tag.split("*");
    // Every tag will at least start with a letter at index 0 (so as not to highlight every word in corpus)
    var start_tag = pieces[0]; // If there are no wildcards, this start tag should be all that's needed 

    var this_tag = "[t^=\"" + start_tag + "\"]"
    var words = document.querySelectorAll(this_tag); // This will grab all the words that start with our tag
    console.log(words);


    // But if there is at least one wildcard in the tail of the tag, the pieces array will contain
    // the non-wildcard "groups" of tags (e.g. DD0*S0 ---> ["DD0","S0"])
    // We will deal with the pieces in the negative. That is, we'll take our large batch of words obtained 
    // above and eliminate the ones that don't match our pieces
    var kept_words = [];
    //console.log(pieces);
    if (pieces.length > 1) { // Our tag has wildcards
        for (var i = 0; i < words.length; i++) {
            // Each word's tag will be tested against the pieces, in turn
            // The "word" is actually an HTML "element", so we need to access the tag we want to look at
            var w_tag = words[i].getAttribute("t");
            //console.log(start_tag+" : "+w_tag);
            var eliminate = false;
            for (var j = start_tag.length; j < w_tag.length; j++) {
                // We start where the start tag left off
                // If this letter is a wildcard, don't eliminate this tag based on this letter (i.e. ignore)
                if (tag[j] == "*") continue;
                // Now that we know it's not a wildcard, if the letters of our tag don't match,
                // we can eliminate it from our words list (i.e. not add it to our kept_words array)
                if (tag[j] != w_tag[j]) { eliminate = true; break; }
            }
            if (eliminate != true) {
                kept_words.push(words[i]);
            }
        }
        words = kept_words;
    }

    if (words.length >= 1) backgroundColor = words[0].style.backgroundColor;

    for (var i = 0; i < words.length; i++) {
        words[i].style.backgroundColor = "yellow";
    };
    tag = ''; // reset tag
    return words;
}


function clearHighlight() {
    var words = document.querySelectorAll("w");
    for (var i = 0; i < words.length; i++) {
        words[i].style.backgroundColor = backgroundColor;
    };
}

var groupings_metaclass = {
    "situation": "situación",
    "fuente": "fuente",
    "terminos": "términos",
    "usos": "uso_didáctico",
    "funciones": "funciones_comunicativas"
};

// Takes in the group_by criterion, the words themselves, the limit on the number of results, and whether 
// the particular criterion has multiple elements that need to be parsed
function groupBy(group_by, words, limit, multiple) {

    // Find out what groupings are involved using these parts of speech
    var groupings = {};
    words.forEach(function(currVal, currIndex, listObj) {
        // Get the word itself
        var word = currVal.innerHTML.trim();

        // Get the grouping described in the metadata for this word
        var texthead = currVal.parentNode.previousElementSibling;
        var meta_grouping = texthead.querySelector("[metaclass=\"" + groupings_metaclass[group_by] + "\"]");
        var grouping = "";
        if (meta_grouping != null) grouping = meta_grouping.innerHTML.split(":")[1].trim();

        // If there are multiple parts to this grouping criterion, separated by commas,
        // split them up and iterate over them
        if (multiple) {
            parts = grouping.split(",");
            for (var i = 0; i < parts.length; i++) {
                groupings = countFreqForWord(word, groupings, parts[i]);
            }
        } else {
            groupings = countFreqForWord(word, groupings, grouping);
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