let viewersBlock = document.getElementById("viewersBlock");
let viewsCounter = document.getElementById("viewsCounter");
let phoneViews = document.getElementById("phoneViews");
let videoId = document.getElementById("videoId").value;
viewsCounter.addEventListener("click", function (event) {
    
    Promise.all([
        fetch("/templates/viewers.mst").then(x => x.text()),
        fetch(`/api/v1/viewers/${videoId}`).then(x => {
            if (x.status == 200) {
                return x.json()
            } else {
                alert("barbata")
                return Promise.reject(404);
            }
        }),

    ]).then(([mst, viewsData]) => {
      
        console.log(viewsData);
        const dataObject = {
            Views: viewsData.views,
            count: viewsData.count
        }
        const renderedHtmlStr = Mustache.render(mst, dataObject);
        return renderedHtmlStr
    }).then(htmlStr => {
        viewersBlock.innerHTML = htmlStr
        phoneViews.classList.add("open");
    }).catch(err => console.error(err));
   
})
phoneViews.addEventListener("click", function (event) {
    phoneViews.classList.remove("open");
    viewersBlock.innerHTML = ""
})
viewersBlock.addeventListener("click",function(event) {
    alert
})
