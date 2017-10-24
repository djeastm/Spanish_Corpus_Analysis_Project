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
        frequencies[word] = frequencies[word]? frequencies[word] + 1 : 1;        
    });

    // Sort to get the highest count at top
    var keysSorted = Object.keys(frequencies).sort(function(a, b) {return -(frequencies[a] - frequencies[b])});

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
        var percent = (100*Object.values(freqSorted[i])[0]/count).toFixed(2);
        freq_html += Object.keys(freqSorted[i])[0] + " : " + Object.values(freqSorted[i])[0] + " (" +percent + "%) <br>";    
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
    var this_tag = "[t^=\"" + tag + "\"]"

    var words = document.querySelectorAll(this_tag);

    if (words.length >= 1) backgroundColor = words[0].style.backgroundColor;

    for (var i = 0; i < words.length; i++) {
        words[i].style.backgroundColor = "yellow";
    };
    tag = '';
    return words;
}

function clearHighlight() {
    var words = document.querySelectorAll("w");
    for (var i = 0; i < words.length; i++) {
        words[i].style.backgroundColor = backgroundColor;
    };
}