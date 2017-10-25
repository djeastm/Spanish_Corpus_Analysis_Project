var tag = '';
var backgroundColor = "white";

function highlight() {
    clearHighlight(); // Turn off all previous highlighting
    pos = document.getElementById("POS").value;
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

    // Count the frequencies of each word
    var frequencies = {};
    words.forEach(function(currVal, currIndex, listObj) {
        var word = currVal.innerHTML.trim();
        frequencies[word] = frequencies[word] ? frequencies[word] + 1 : 1;
    });

    // Sort to get the highest count at top
    var keysSorted = Object.keys(frequencies).sort(function(a, b) { return -(frequencies[a] - frequencies[b]) });

    // Push the sorted keys into an array along with their values from the frequencies object
    var freqSorted = [];
    for (var i = 0; i < keysSorted.length; i++) {
        var key = keysSorted[i];
        var value = frequencies[key];
        var pair = {};
        pair[key] = value;
        freqSorted.push(pair);
    }

    // Build HTML for each word frequency in the list, along with a percentage of the count that word comprises
    freq_html = "";
    for (var i = 0; i < freqSorted.length; i++) {
        var percent = (100 * Object.values(freqSorted[i])[0] / count).toFixed(2);
        freq_html += Object.keys(freqSorted[i])[0] + " : " + Object.values(freqSorted[i])[0] + " (" + percent + "%) <br>";
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