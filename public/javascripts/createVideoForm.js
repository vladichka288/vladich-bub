
    let createVideoForm = document.getElementById("createVideoForm")
    let inputName = document.getElementById("inputName")
    let errorName = document.getElementById("errorName")
    let videoFileUpload = document.getElementById("videoFileUpload")
    let errorVideoFileUpload = document.getElementById("errorVideoFileUpload")
    let photoFileUpload = document.getElementById("photoFileUpload")
    let errorPhotoFileUpload = document.getElementById("errorPhotoFileUpload")
    let submit = document.getElementById("submit");

    videoFileUpload.addEventListener("input", function (event) {
        if (videoFileUpload.value.substr(videoFileUpload.value.length - 4, videoFileUpload.value.length) == ".mp4") {
            errorVideoFileUpload.innerHTML = "&nbsp";
        } else {
            errorVideoFileUpload.innerHTML = "video has to be in mp4 format";
        }
    })
    photoFileUpload.addEventListener("input", function (event) {
        let format = photoFileUpload.value.substr(photoFileUpload.value.length - 4, photoFileUpload.value.length);
        if (format == ".png" || format == ".jpg" || format == ".jpeg") {
            errorPhotoFileUpload.innerHTML = "&nbsp";
        } else {
            errorPhotoFileUpload.innerHTML = "photo has to be in jpg/png/jpeg format";
        }
    })
    inputName.addEventListener("input", function (event) {
        if (inputName.validity.valid) {
            inputName.classList.remove("error-style");
            errorName.innerHTML = "&nbsp";
        } else {
            inputName.classList.add("error-style");
            errorName.innerHTML = "name is required and must be less then 30 symbols";
        }
    },false)

    createVideoForm.addEventListener("input", function (event) {
        submit.disabled = true;
        formatVideo =videoFileUpload.value.substr(videoFileUpload.value.length - 4, videoFileUpload.value.length)
        formatPhoto = photoFileUpload.value.substr(photoFileUpload.value.length - 4, photoFileUpload.value.length);
        if (inputName.validity.valid) {
            if(formatVideo == ".mp4"){
                if(formatPhoto == ".png" || formatPhoto == ".jpeg"|| formatPhoto == ".jpg"){
                    submit.disabled = false;
                }
            }
        }
    }, false)
