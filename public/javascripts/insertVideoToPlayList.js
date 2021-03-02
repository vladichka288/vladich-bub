let insertVideoForm = document.getElementById("insertVideoForm");
let selector = document.getElementById("selector");
let button = document.getElementById("submit");
let selectedPlaylist = document.getElementById("selectedPlaylist");

selectedPlaylist.value = selector.value;
selector.addEventListener("change", function (event) {
    selectedPlaylist.value = selector.value;
})
