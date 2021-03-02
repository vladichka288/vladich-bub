let page = 1;
let search = "";
let searchButtonClicked = false;
let userIdValue = document.getElementById("userFilter").value;


let prevButton = document.getElementById("prevButton");
let nextButton = document.getElementById("nextButton");
let searchButton = document.getElementById("searchButton");
let inputSearchName = document.getElementById("inputSearchName");
let html_text = document.getElementById("html_text");
let buttonsDIVIUS = document.getElementById("buttonsDIVIUS");
let buttonsDiv = document.getElementById("buttonsDiv");
span = document.createElement("span");
span.classList.add("counter");
buttonsDIVIUS.insertBefore(span, nextButton);
const appEl = document.getElementById('app');
div = document.createElement("div");
div.style.cssFloat = "left";
appEl.insertBefore(div, buttonsDiv);
mainError = document.getElementById("mainError");
let mainErrorText = document.getElementById("mainErrorText");

console.log("Loading Browser JS app,js");
function startingDownload() {
    if (userIdValue) {
        alert("lol");
        Promise.all([
            fetch("/templates/videosItems.mst").then(x => x.text()),
            fetch(`/api/v1/usersVideo?userId=${userIdValue}&page=1`).then(x => x.json()),

        ]).then(([mst, videosData]) => {
            console.log(videosData);
            if (videosData.videos.length != 0) {
                const dataObject = {
                    Videos: videosData.videos,
                    countOfPages: videosData.lastPage
                }
                const renderedHtmlStr = Mustache.render(mst, dataObject);
                span.innerHTML = `${page}\\${
                    dataObject.countOfPages
                }`;
                return renderedHtmlStr
            } else {
                const dataObject = {
                    Videos: undefined,
                    pageNumber: 0,
                    countOfPages: 0

                }
                const renderedHtmlStr = Mustache.render(mst, dataObject);
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;
                return renderedHtmlStr;
            }
        }).then(htmlStr => {
            console.log('htmlStr', htmlStr);
            div.innerHTML = htmlStr;
        }).catch(err => console.error(err));
    } else {
        Promise.all([
            fetch("/templates/videosItems.mst").then(x => x.text()),
            fetch("/api/v1/getAllVideos?page=1").then(x => x.json()),

        ]).then(([mst, videosData]) => {
            if (videosData.videos.length != 0) {
                const dataObject = {
                    Videos: videosData.videos,
                    pageNumber: 1,
                    countOfPages: videosData.link.lastPageApi

                }
                const renderedHtmlStr = Mustache.render(mst, dataObject);
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;


                return renderedHtmlStr
            } else {
                const dataObject = {
                    Videos: undefined,
                    pageNumber: 0,
                    countOfPages: 0

                }
                const renderedHtmlStr = Mustache.render(mst, dataObject);
                span.innerHTML = `${
                    dataObject.pageNumber
                }\\${
                    dataObject.countOfPages
                }`;

                return renderedHtmlStr;
            }


        }).then(htmlStr => {
            console.log('htmlStr', htmlStr);


            div.innerHTML = htmlStr;


        }).catch(err => console.error(err));
    }
};
startingDownload();
prevButton.addEventListener("click", function (event) {
    if (searchButtonClicked == false) {
        if ((page - 1) <= 0) {
            page = 1;
        } else {
            page -= 1;
            if (userIdValue) {
                Promise.all([
                    fetch("/templates/videosItems.mst").then(x => x.text()),
                    fetch(`/api/v1/usersVideo?userId=${userIdValue}&page=${page}`).then(x => x.json()),
                ]).then(([mst, videosData]) => {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: page,
                        countOfPages: videosData.lastPage
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr
                }).then(htmlStr => {
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr;
                }).catch(err => console.error(err));
            } else {
                Promise.all([
                    fetch("/templates/videosItems.mst").then(x => x.text()),
                    fetch(`/api/v1/getAllVideos?page=${page}`).then(x => x.json()),

                ]).then(([mst, videosData]) => {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: page,
                        countOfPages: videosData.link.lastPageApi
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr
                }).then(htmlStr => {
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr;
                }).catch(err => console.error(err));
            }
        }
    } else {
        if (userIdValue) {
            if ((page - 1) <= 0) {
                page = 1;
            } else {
                page -= 1;
                Promise.all([
                    fetch("/templates/videosItems.mst").then(x => x.text()),
                    fetch(`/api/v1/usersVideo?userId=${userIdValue}&search=${search}&page=${page}`).then(x => x.json()),

                ]).then(([mst, videosData]) => {
                    if (videosData.videos.length != 0) {

                        const dataObject = {
                            Videos: videosData.videos,
                            pageNumber: page,
                            countOfPages: videosData.link.lastPageApi
                        }


                        const renderedHtmlStr = Mustache.render(mst, dataObject);

                        span.innerHTML = `${
                            dataObject.pageNumber
                        }\\${
                            dataObject.countOfPages
                        }`;


                        return renderedHtmlStr;
                    } else {
                        const dataObject = {
                            Videos: videosData.videos,
                            pageNumber: 0,
                            countOfPages: 0
                        }
                        mainError.style.display = "block";
                        mainError.style.cssFloat = "left";
                        mainErrorText.style.display = "block";
                        mainErrorText.style.cssFloat = "left";

                        const renderedHtmlStr = Mustache.render(mst, dataObject);
                        span.innerHTML = `${
                            dataObject.pageNumber
                        }\\${
                            dataObject.countOfPages
                        }`;
                        return renderedHtmlStr
                    }
                }).then(htmlStr => {
                    console.log('htmlStr', htmlStr);


                    div.innerHTML = htmlStr;

                }).catch(err => console.error(err));


            }
        } else {
            if ((page - 1) <= 0) {
                page = 1;
            } else {
                page -= 1;
                Promise.all([
                    fetch("/templates/videosItems.mst").then(x => x.text()),
                    fetch(`/api/v1/videosGetByName/${search}?page=${page}`).then(x => x.json()),

                ]).then(([mst, videosData]) => {
                    if (videosData.videos.length != 0) {

                        const dataObject = {
                            Videos: videosData.videos,
                            pageNumber: page,
                            countOfPages: videosData.link.lastPageApi
                        }


                        const renderedHtmlStr = Mustache.render(mst, dataObject);

                        span.innerHTML = `${
                            dataObject.pageNumber
                        }\\${
                            dataObject.countOfPages
                        }`;


                        return renderedHtmlStr;
                    } else {
                        const dataObject = {
                            Videos: videosData.videos,
                            pageNumber: 0,
                            countOfPages: 0
                        }
                        mainError.style.display = "block";
                        mainError.style.cssFloat = "left";
                        mainErrorText.style.display = "block";
                        mainErrorText.style.cssFloat = "left";

                        const renderedHtmlStr = Mustache.render(mst, dataObject);
                        span.innerHTML = `${
                            dataObject.pageNumber
                        }\\${
                            dataObject.countOfPages
                        }`;
                        return renderedHtmlStr
                    }
                }).then(htmlStr => {
                    console.log('htmlStr', htmlStr);


                    div.innerHTML = htmlStr;

                }).catch(err => console.error(err));
            }
        }
    }
}, false)
nextButton.addEventListener("click", function (event) {
    if (searchButtonClicked == false) {
        if (userIdValue) {
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
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
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
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr
                }
            }).catch(err => console.error(err));
        } else {
            page += 1;
            console.log(page);

            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/getAllVideos?page=${page}`).then(x => x.json()),


            ]).then(([mst, videosData]) => {
                if (videosData.videos.length != 0) {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: page,
                        countOfPages: videosData.link.lastPageApi
                    }

                    const renderedHtmlStr = Mustache.render(mst, dataObject);

                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;


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
                    console.log('htmlStr', htmlStr);


                    div.innerHTML = htmlStr;


                }

            }).catch(err => console.error(err));
        }

    } else {
        if (userIdValue) {
            page += 1;
            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/usersVideo?userId=${userIdValue}&search=${search}&page=${page}`).then(x => x.json()),

            ]).then(([mst, videosData]) => {
                if (videosData.videos.length != 0) {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: page,
                        countOfPages: videosData.link.lastPageApi
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr;
                } else {
                    page -= 1;
                    console.log(page);
                }
            }).then(htmlStr => {
                if (!htmlStr) {
                    event.preventDefault()
                } else {
                    div.innerHTML = htmlStr;
                }
            }).catch(err => console.error(err));
        } else {
            page += 1;
            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/videosGetByName/${search}?page=${page}`).then(x => x.json()),

            ]).then(([mst, videosData]) => {
                if (videosData.videos.length != 0) {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: page,
                        countOfPages: videosData.link.lastPageApi
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr;
                } else {
                    page -= 1;
                    console.log(page);
                }
            }).then(htmlStr => {
                if (!htmlStr) {
                    event.preventDefault()
                } else {
                    console.log('htmlStr', htmlStr);
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr;
                }
            }).catch(err => console.error(err));
        }
    }
}, false)
searchButton.addEventListener("click", function (event) {
    if (userIdValue) {
        mainError.style.display = "none";
        mainErrorText.style.display = "none";
        if (inputSearchName.value == "") {
            page = 1;
            searchButtonClicked = false;
            html_text.innerHTML = "";
            startingDownload();
        } else {
            page = 1;
            searchButtonClicked = true;
            search = inputSearchName.value;
            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/usersVideo?userId=${userIdValue}&search=${search}&page=1`).then(x => x.json()),
            ]).then(([mst, videosData]) => {
                if (videosData.videos.length != 0) {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: 1,
                        countOfPages: videosData.link.lastPageApi
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr;
                } else {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: 0,
                        countOfPages: 0
                    }
                    mainError.style.display = "block";
                    mainError.style.cssFloat = "left";
                    mainErrorText.style.display = "block";
                    mainErrorText.style.cssFloat = "left";
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr
                }
            }).then(htmlStr => {
                if (htmlStr) {
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr;
                }
            }).catch(err => console.error(err));
        }
    } else {
        mainError.style.display = "none";
        mainErrorText.style.display = "none";
        if (inputSearchName.value == "") {
            page = 1;
            searchButtonClicked = false;
            html_text.innerHTML = "";
            startingDownload();
        } else {
            page = 1;
            searchButtonClicked = true;
            search = inputSearchName.value;
            Promise.all([
                fetch("/templates/videosItems.mst").then(x => x.text()),
                fetch(`/api/v1/videosGetByName/${search}?page=1`).then(x => x.json()),
            ]).then(([mst, videosData]) => {
                if (videosData.videos.length != 0) {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: 1,
                        countOfPages: videosData.link.lastPageApi
                    }
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr;
                } else {
                    const dataObject = {
                        Videos: videosData.videos,
                        pageNumber: 0,
                        countOfPages: 0
                    }
                    mainError.style.display = "block";
                    mainError.style.cssFloat = "left";
                    mainErrorText.style.display = "block";
                    mainErrorText.style.cssFloat = "left";
                    const renderedHtmlStr = Mustache.render(mst, dataObject);
                    span.innerHTML = `${
                        dataObject.pageNumber
                    }\\${
                        dataObject.countOfPages
                    }`;
                    return renderedHtmlStr
                }
            }).then(htmlStr => {
                if (htmlStr) {
                    console.log('htmlStr', htmlStr);
                    div.innerHTML = htmlStr;
                }
            }).catch(err => console.error(err));
        }


    }
});
