
    let jsModal = document.getElementById("jsModal");
    let formDelete = document.getElementById("formDelete");
    let inputSubmit = document.getElementById("inputSubmit");
    let phon = document.getElementById("phon");
    let butConf = document.getElementById("butConf");
    let butReject = document.getElementById("butReject");
    let deleteHref = document.getElementById("deleteHref");
    deleteHref.addEventListener("click", function (event) {
        event.preventDefault();
        phon.classList.add("open");
    })
    butConf.addEventListener("click", function (event) {
        window.location.href = deleteHref.href;
    }, false)
    butReject.addEventListener("click", function (event) {
        phon.classList.remove("open");
    }, false)

