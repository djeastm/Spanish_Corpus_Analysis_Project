// var sheet = (function() {
//     // Create the <style> tag
//     var style = document.createElement("style");

//     // Add a media (and/or media query) here if you'd like!
//     // style.setAttribute("media", "screen")
//     // style.setAttribute("media", "only screen and (max-width : 1024px)")

//     // WebKit hack :(
//     style.appendChild(document.createTextNode(""));

//     // Add the <style> element to the page
//     document.head.appendChild(style);

//     return style.sheet;
// })();

// sheet.insertRule("[t^=\"V\"] {background-color: blue;}", 1);
var words = document.querySelectorAll("[t^=\"V\"]");
for (var i = 0; i < words.length; i++) {
    words[i].style.backgroundColor="blue";
};