
    let jsModal = document.getElementById("jsModal");
    let formDelete = document.getElementById("formDelete");
    let inputSubmit = document.getElementById("inputSubmit");
    let phon = document.getElementById("phon");
    let butConf = document.getElementById("butConf");
    let butReject = document.getElementById("butReject");
    
    formDelete.addEventListener("submit", function (event) {
        alert("baba");
        event.preventDefault();
        phon.classList.add("open");
    })
    butConf.addEventListener("click", function (event) {
        formDelete.submit();
    },false)
    butReject.addEventListener("click", function (event) {
        phon.classList.remove("open");
    },false)

