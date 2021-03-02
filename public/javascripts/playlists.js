let page = 1;
let playlistsRender = document.getElementById("playlistsRender");
let nextButton = document.getElementById("nextButton");
let prevButton = document.getElementById("prevButton");
let counterPages = document.getElementById("counterPages");
let table = document.getElementById("table");
function addEventListenersForDelete() {
    let foreachDeleteForm = [];
    foreachDeleteForm = document.getElementsByClassName("foreachDeleteForm");
    let phon = document.getElementById("phon");
    let butConf = document.getElementById("butConf");
    let butReject = document.getElementById("butReject");
    for (let i = 0; i < foreachDeleteForm.length; i++) {
        foreachDeleteForm[i].addEventListener("submit", function (event) {
            alert("baba");
            event.preventDefault();
            phon.classList.add("open");
        })
        butConf.addEventListener("click", function (event) {
            foreachDeleteForm[i].submit();
        }, false)
        butReject.addEventListener("click", function (event) {
            phon.classList.remove("open");
        }, false)
    }
}

function startingDownload() {
    Promise.all([
        fetch("/templates/playlist.mst").then(x => x.text()),
        fetch("/api/v1/getUserPlayList?page=1").then(x => {
            if (x.ok) {
                return x.json()
            } else {
                if (x.status == 405) {
                    return Promise.reject("user does not have playlist");
                } else {
                    return Promise.reject("lol");
                }

            }

        }),

    ]).then(([mst, playlistData]) => {
        const dataObject = {
            allPlayLists: playlistData.allPlayLists,
            pageNumber: 1,
            countOfPages: playlistData.countOfPages
        }
        console.log(dataObject);
        const renderedHtmlStr = Mustache.render(mst, dataObject);
        counterPages.innerText = `${
            dataObject.pageNumber
        }/${
            dataObject.countOfPages
        }`;
        return renderedHtmlStr;
    }).then(htmlStr => {
        playlistsRender.innerHTML = htmlStr;
        addEventListenersForDelete();

    }).catch((err) => {
        if (err == "user does not have playlist") {
            table.removeChild(nextButton);
            table.removeChild(prevButton);
            table.removeChild(counterPages);
        } else {
            playlistsRender.innerHTML = err;
        }
    });
};
startingDownload();
nextButton.addEventListener("click", function (event) {
    console.log("turra");
    page += 1;
    Promise.all([
        fetch("/templates/playlist.mst").then(x => x.text()),
        fetch(`/api/v1/getUserPlayList?page=${page}`).then(x => {
            if (x.ok) {
                return x.json()
            } else {
                if (x.status == 404) 
                    console.log("error");
                


                return Promise.reject("lol");
            }
        })
    ]).then(([mst, playlistData]) => {
        console.log("param");
        const dataObject = {
            allPlayLists: playlistData.allPlayLists,
            pageNumber: 1,
            countOfPages: playlistData.countOfPages
        }
        console.log(dataObject);
        const renderedHtmlStr = Mustache.render(mst, dataObject);
        counterPages.innerText = `${page}/${
            dataObject.countOfPages
        }`;
        return renderedHtmlStr;
    }).then(htmlStr => {
        playlistsRender.innerHTML = htmlStr;
        addEventListenersForDelete();

    }).catch(err => {
        console.log(err);
        page -= 1;

    })


})
prevButton.addEventListener("click", function (event) {
    console.log("turra");
    page -= 1;
    Promise.all([
        fetch("/templates/playlist.mst").then(x => x.text()),
        fetch(`/api/v1/getUserPlayList?page=${page}`).then(x => {
            if (x.ok) {
                return x.json()
            } else {
                if (x.status == 404) 
                    console.log("error");
                


                return Promise.reject("lol");
            }
        })
    ]).then(([mst, playlistData]) => {
        console.log("param");
        const dataObject = {
            allPlayLists: playlistData.allPlayLists,
            pageNumber: 1,
            countOfPages: playlistData.countOfPages
        }
        console.log(dataObject);
        counterPages.innerText = `${page}/${
            dataObject.countOfPages
        }`;
        const renderedHtmlStr = Mustache.render(mst, dataObject);
        return renderedHtmlStr;
    }).then(htmlStr => {
        playlistsRender.innerHTML = htmlStr;
        addEventListenersForDelete();
    }).catch(err => {
        console.log(err);
        page += 1;
    })


})
