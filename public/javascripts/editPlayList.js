
    let editForm = document.getElementById("editForm")
    let inputName = document.getElementById("inputName")
    let errorNameInput = document.getElementById("errorNameInput")
    let descInput = document.getElementById("descInput")
    let errorDescInput = document.getElementById("errorDescInput")
    let submit = document.getElementById("submit");
    inputName.addEventListener("input", function (event) {
        if (inputName.validity.valid) {
            inputName.classList.remove("error-style");
            errorNameInput.innerHTML = "&nbsp";
        } else {
            inputName.classList.add("error-style");
            errorNameInput.innerHTML = "name is required and must be less then 30 symbols";
        }
    }, false)
    descInput.addEventListener("input", function (event) {
        if (descInput.validity.valid) {
            descInput.classList.remove("error-style");
            errorDescInput.innerHTML = "&nbsp";
        } else {
            descInput.classList.add("error-style");
            errorDescInput.innerHTML = "description must be less then 200 symbols";
        }
    }, false)
    editForm.addEventListener("input", function (event) {
        submit.disabled = true;
        if (inputName.validity.valid) {
            if (descInput.validity.valid) {
                submit.disabled = false;
            }
        }
    }, false)

