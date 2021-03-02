let page = 1;


    let mainContent = document.getElementById("mainContent");
    let prevButton = document.getElementById("prevButton");
    let nextButton = document.getElementById("nextButton");
    let byrkinafaso = document.getElementById("byrkinafaso");
    let mainError = document.getElementById("mainError");
    let searchButton = document.getElementById("searchButton");
    let inputSearchName = document.getElementById("inputSearchName");
    let html_text = document.getElementById("html_text");
    let uploadButton = document.getElementById("uploadButton")
    span = document.createElement("span");
    span.classList.add("counter");
    let userId = document.getElementById("userId");
    let userIdValue = userId.value; 
    buttonsDIVIUS.insertBefore(span, nextButton);
    console.log("Loading Browser JS app,js");
    function startingDownload() {
        Promise.all([
            fetch("/templates/videosItems.mst").then(x => x.text()),
            fetch(`/api/v1/usersVideo?userId=${userIdValue}&page=1`).then(x => x.json()),

        ]).then(([mst, videosData]) => {
            if (videosData.videos.length != 0) {
                const dataObject = {
                    Videos: videosData.videos,
                    pageNumber: 1,
                    countOfPages: videosData.lastPage
                }
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;

                const renderedHtmlStr = Mustache.render(mst, dataObject);
                return renderedHtmlStr
            } else {
                const dataObject = {
                    Videos: undefined,
                    pageNumber: 0,
                    countOfPages: 0
                }


                const renderedHtmlStr = "";
                return renderedHtmlStr
            }


        }).then(htmlStr => {
            const appEl = document.getElementById('app');
            if (htmlStr) {
                appEl.innerHTML = htmlStr;

            } else {
                console.log("BRAAAAA");
                mainContent.removeChild(byrkinafaso);
                let divPhoto = document.createElement("div");
                divPhoto.classList.add("mainError");
                let buttonUpload = document.createElement("button");
                buttonUpload.addEventListener("click",function(event){
                    window.location.href ="/new";
                })
                buttonUpload.classList.add("uploadButton");
                buttonUpload.innerText = "upload video";
                mainContent_2 = document.getElementById("mainContent_2");
                mainContent_2.appendChild(buttonUpload);
                mainContent_2.appendChild(divPhoto);


            }

        }).catch(err => console.error(err));
    };
    startingDownload();
    prevButton.addEventListener("click", function (event) {

        if ((page - 1) < 1) {
            page = 1;
        } else {
            page -= 1;
            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/usersVideo?userId=${userIdValue}&page=${page}`).then(x => x.json()),

            ]).then(([mst, videosData]) => {
                const dataObject = {
                    Videos: videosData.videos,
                    pageNumber: page,
                    countOfPages: videosData.lastPage
                }
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;


                const renderedHtmlStr = Mustache.render(mst, dataObject);
                return renderedHtmlStr
            }).then(htmlStr => {
                console.log('htmlStr', htmlStr);
                const appEl = document.getElementById('app');
                appEl.innerHTML = htmlStr;
            }).catch(err => console.error(err));
        }


    }, false)

    nextButton.addEventListener("click", function (event) {
        page += 1;
        console.log(page);

        Promise.all([
            fetch("/templates/videosItems.mst").then(x => x.text()),
            fetch(`/api/v1/usersVideo?userId=${userIdValue}&page=${page}`).then(x => x.json()),
        ]).then(([mst, videosData]) => {
            if (videosData.videos.length != 0) {
                const dataObject = {
                    Videos: videosData.videos,
                    pageNumber: page,
                    countOfPages: videosData.lastPage
                }
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;
                const renderedHtmlStr = Mustache.render(mst, dataObject);


                return renderedHtmlStr;

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
            }

        }).catch(err => console.error(err));
        

    }, false)
    uploadButton.addEventListener("click", function (event) {
        window.location.href = "/new"
    })


