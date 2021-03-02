let page = 1;
let playlistInput = document.getElementById("playlistId");
let playlistId = playlistInput.value;


let mainContent = document.getElementById("mainContent");
let prevButton = document.getElementById("prevButton");
let nextButton = document.getElementById("nextButton");
let byrkinafaso = document.getElementById("byrkinafaso");
let mainError = document.getElementById("mainError");
let searchButton = document.getElementById("searchButton");
let inputSearchName = document.getElementById("inputSearchName");
let html_text = document.getElementById("html_text");
let uploadButton = document.getElementById("uploadButton")
let arrayInputPlaylistId = document.getElementsByClassName("playlistIdCLASS");
span = document.createElement("span");
span.classList.add("counter");
buttonsDIVIUS.insertBefore(span, nextButton);
console.log("Loading Browser JS app,js");


function startingDownload() {
    Promise.all([
        fetch("/templates/selectedPlayList.mst").then(x => x.text()),
        fetch(`/api/v1/getPlayListById?playlistId=${playlistId}&page=1`).then(x => {
            console.log("xyasasasa");
            if (x.ok) {
                return x.json();
            } else {
                console.log("bub");
                if (x.statusText == "playlist does not contain videos") {

                    return Promise.reject(x.statusText);

                }
                return Promise.reject("some error");
            }
        })
    ]).then(([mst, videosData]) => {


        const dataObject = {
            Videos: videosData.videos,
            pageNumber: 1,
            countOfPages: videosData.count
        }
        span.innerHTML = `${
            dataObject.pageNumber
        }\\${
            dataObject.countOfPages
        }`;

        const renderedHtmlStr = Mustache.render(mst, dataObject);
        return renderedHtmlStr;
    }).then(htmlStr => {
        const appEl = document.getElementById('app');
        if (htmlStr) {
            appEl.innerHTML = htmlStr;
            for (let inputPlaylistId of arrayInputPlaylistId) {
                inputPlaylistId.value = playlistId;
            }

        } else {
            mainContent.removeChild(byrkinafaso);
            let divPhoto = document.createElement("div");
            divPhoto.classList.add("mainError");
            let buttonUpload = document.createElement("button");
            buttonUpload.addEventListener("click", function (event) {
                window.location.href = "/new";
            })
            buttonUpload.classList.add("uploadButton");
            buttonUpload.innerText = "upload video";
            mainContent_2 = document.getElementById("mainContent_2");
            mainContent_2.appendChild(buttonUpload);
            mainContent_2.appendChild(divPhoto);


        }
    }).catch(err => {
        if (err == "playlist does not contain videos") {
            mainContent.removeChild(byrkinafaso);
            mainContent_2 = document.getElementById("mainContent_2");
            let divNoPlaylist = document.createElement("div");
            divNoPlaylist.classList.add("noPlaylistStyle");
            divNoPlaylist.innerText = "Playlist is empty!"
            mainContent_2.appendChild(divNoPlaylist);

        } else {
            console.error(err);
        }

    })
}
startingDownload();
prevButton.addEventListener("click", function (event) {

    if ((page - 1) < 1) {
        page = 1;
    } else {
        page -= 1;
        Promise.all([
            fetch("/templates/selectedPlayList.mst").then(x => x.text()),
            fetch(`/api/v1/getPlayListById?playlistId=${playlistId}&page=${page}`).then(x => {
                if (x.ok) {
                    return x.json();
                } else {
                    page += 1;
                    return Promise.reject("some error");
                }
            }),

        ]).then(([mst, videosData]) => {
            const dataObject = {
                Videos: videosData.videos,
                pageNumber: 1,
                countOfPages: videosData.count
            }
            span.innerHTML = `${page}\\${
                dataObject.countOfPages
            }`;


            const renderedHtmlStr = Mustache.render(mst, dataObject);
            return renderedHtmlStr
        }).then(htmlStr => {
            console.log('htmlStr', htmlStr);
            const appEl = document.getElementById('app');
            appEl.innerHTML = htmlStr;
            for (let inputPlaylistId of arrayInputPlaylistId) {
                inputPlaylistId.value = playlistId;
            }
        }).catch(err => console.error(err));
    }
}, false)
nextButton.addEventListener("click", function (event) {
    page += 1;
    console.log(page);

    Promise.all([
        fetch("/templates/selectedPlayList.mst").then(x => x.text()),
        fetch(`/api/v1/getPlayListById?playlistId=${playlistId}&page=${page}`).then(x => {
            if (x.ok) {
                return x.json();
            } else {
                page -= 1;
                return Promise.reject("some error");
            }
        }),


    ]).then(([mst, videosData]) => {
        if (videosData.videos.length != 0) {
            const dataObject = {
                Videos: videosData.videos,
                pageNumber: 1,
                countOfPages: videosData.count
            }
            span.innerHTML = `${page}\\${
                dataObject.countOfPages
            }`;

            const renderedHtmlStr = Mustache.render(mst, dataObject);
            return renderedHtmlStr

        } else {
            page -= 1;

            console.log(page);

        }
    }).then(htmlStr => {

        if (!htmlStr) {
            event.preventDefault();
        } else {
            console.log('htmlStr', htmlStr);
            const appEl = document.getElementById('app');
            appEl.innerHTML = htmlStr;
            for (let inputPlaylistId of arrayInputPlaylistId) {
                inputPlaylistId.value = playlistId;
            }
        }

    }).catch(err => console.error(err));
}, false)
