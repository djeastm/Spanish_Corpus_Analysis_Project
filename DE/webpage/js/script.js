var tag = '';
var backgroundColor = "white";

function highlight() {
    clearHighlight(); // Turn off all previous highlighting

    var pos = document.getElementById("POS").value;
    tag = pos;

    var selects = document.querySelectorAll("[type=\"" + pos + "\"]");

    // Build the tag (global) from each of the dropdown select boxes chosen by user
    for (var i = 0; i < selects.length; i++) {
        ind = selects[i].selectedIndex;
        val = selects[i].options[ind].value;
        if (val == "0") break;
        tag += val;
    }

    // Highlight the words 
    var words = highlightTaggedWords();    

    // Get total word count
    var count = words.length;

    // Determine how/if the results will be grouped
    var group_by = document.getElementById("group_by").value;

    // Determine how many of each grouping, or of total, if no grouping
    var limit = document.getElementById("limit").value;
    if (!Number.isInteger(limit) || limit <= 0) limit = 10; // quick validation and handling

    if (group_by == "0") {
        freq_dict = {};
        words.forEach(function(currVal, currIndex, listObj) {
            // Get the word itself
            var word = currVal.innerHTML.trim();

            // Count the frequencies of each word
            if (freq_dict[word]) {                         
                freq_dict[word] = freq_dict[word]? freq_dict[word] + 1 : 1;            
            } else {
                // If the word isn't already in our dictionary, create a new spot for it with its frequency                
                freq_dict[word] = 1;                                        
            }
        });

        freq_html = buildFreqList(freq_dict, count, limit);
    }
    else if (group_by == "S") {
        // the groupBy function will take care of building the html grouped by whatever grouping metaclass
        // we choose
        freq_html = groupBy("situation", words, limit);
    } else {

    }

    // Update HTML with new data
    document.getElementById("word_count").innerHTML = count;
    document.getElementById("frequencies").innerHTML = freq_html;

    event.preventDefault(); // disable normal form submit behavior

    return false; // prevent further bubbling of event
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

function highlightTaggedWords() {

    var pieces = tag.split("*");
    // Every tag will at least start with a letter at index 0 (so as not to highlight every word in corpus)
    var start_tag = pieces[0]; // If there are no wildcards, this start tag should be all that's needed    
    var this_tag = "[t^=\"" + start_tag + "\"]"
    var words = document.querySelectorAll(this_tag); // This will grab all the words that start with our tag

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
                if (tag[j] != w_tag[j]) {eliminate = true; break; }               
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

groupings_metaclass = {"situation": "situación"}

function groupBy(group_by, words, limit) {

    // Find out what groupings are involved using these parts of speech
    var groupings = {};
    words.forEach(function(currVal, currIndex, listObj) {
        // Get the word itself
        var word = currVal.innerHTML.trim();

        // Get the grouping described in the metadata for this word
        var texthead = currVal.parentNode.previousElementSibling;        
        var meta_grouping = texthead.querySelector("[metaclass=\""+groupings_metaclass[group_by]+"\"]");
        var grouping = "";
        if (meta_grouping != null) grouping = meta_grouping.innerHTML.split(":")[1].trim();

        // Count the frequencies of each word contained in each grouping
        if (groupings[grouping]) {
            groupings[grouping].sit_count += 1;            
            groupings[grouping].freq_dict[word] = groupings[grouping].freq_dict[word]?
                                                    groupings[grouping].freq_dict[word] + 1 : 1;            
        } else {
            // If the grouping isn't already in our dictionary, create a new spot for it, along with its own
            // frequency dictionary
            var frequencies = {};
            frequencies[word] = 1;                        
            groupings[grouping] = {sit_count: 1, freq_dict: frequencies};
        }
    });

    // Sort descending by the groupings with the most words
    var groupingsSorted = Object.keys(groupings).sort(function(a, b) {return -(groupings[a].sit_count - groupings[b].sit_count);});
    
    group_html = "";
    for (var i = 0; i < groupingsSorted.length; i++) { 
        var grouping = groupingsSorted[i];
        group_html += "<h3>"+grouping+" ("+groupings[grouping].sit_count+" matches)"+"</h3><br>"       
        group_html += buildFreqList(groupings[grouping].freq_dict,
                                    groupings[grouping].sit_count,
                                    limit);
        group_html += "<br>";   
    };

    return group_html;
}

function buildFreqList(freq_dict, sit_count, limit) {

    // Sort to get the highest count at top
    var keysSorted = Object.keys(freq_dict).sort(function(a, b) {return -(freq_dict[a] - freq_dict[b]);});

    // Push the sorted keys into an array along with their values from the frequencies object
    var freqSorted = [];
    for (var j = 0; j < keysSorted.length; j++) {
        var key = keysSorted[j];
        var value = freq_dict[key];        
        var pair = {};
        pair[key] = value;
        freqSorted.push(pair);
    }

    freq_html = "";
    // Build HTML for each word frequency in the list, along with a percentage of the count that word comprises 
    for (var j = 0; j < freqSorted.length; j++) {
        if (j == limit-1) break; // only take top results up to limit chosen by user
        var percent = (100 * Object.values(freqSorted[j])[0] / sit_count).toFixed(2);
        freq_html += Object.keys(freqSorted[j])[0] + " : " + Object.values(freqSorted[j])[0] + " (" + percent + "%) <br>";
    }
     
    return freq_html;
}
