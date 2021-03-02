
    let userPhoto = document.getElementById("userPhoto");
    let uddateUserPhotoForm = document.getElementById("uddateUserPhotoForm");
    let lol = document.getElementById("lol");
    userPhoto.addEventListener("click", function (event) {
        alert("lol")
        lol.click();
    })
    lol.addEventListener("input", function (event) {
        alert("pyyk");
        let format = lol.value.substr(lol.value.length - 4, lol.value.length);
        console.log(format)
        if (format == ".png" || format == ".jpg" || format == ".jpeg") {
            uddateUserPhotoForm.submit();
        } else {
            errorPhotoFileUpload.innerHTML = "photo has to be in jpg/png/jpeg format";
        }
    })

