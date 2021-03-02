let email = document.getElementById("login");
let pass = document.getElementById("pass");
let confirmPass = document.getElementById("confirmPass");
let buttonSubmit = document.getElementById("butSubmit");
let errorEmail = document.getElementById("errorLoginInput");
let errorPass = document.getElementById("errorPassInput");
let errorConfirmPass = document.getElementById("errorConfirmPassInput");
let formReg = document.getElementById("formReg");
let userName = document.getElementById("userName");
let errorUserNameInput = document.getElementById("errorUserNameInput");

userName.addEventListener('input', function (req, res) {
    if (userName.value == "") {
        errorUserNameInput.innerHTML = "&nbsp";
        userName.classList.remove("invalid_input");
    } else if (userName.validity.valid) {
        userName.classList.remove("invalid_input");
        errorUserNameInput.innerHTML = "&nbsp";
    } else {
        errorUserNameInput.innerHTML = "Username must be from 5 to 10 characters"
        userName.classList.add("invalid_input");
    }
})
email.addEventListener("input", function (event) {
    if (email.value == "") {
        errorEmail.innerHTML = "&nbsp";
        email.classList.remove("invalid_input");
    } else if (email.validity.valid) {
        email.classList.remove("invalid_input");
        errorEmail.innerHTML = "&nbsp";

    } else {
        errorEmail.innerHTML = "Login must be from 5 to 10 characters"
        email.classList.add("invalid_input");
    }

}, false);
pass.addEventListener("input", function (event) {
    if (pass.value == "") {
        errorPass.innerHTML = "&nbsp";
        pass.classList.remove("invalid_input");
    } else if (pass.validity.valid) {

        pass.classList.remove("invalid_input");
        errorPass.innerHTML = "&nbsp";

    } else {
        errorPass.innerHTML = "Password must be from 8 to 15 characters"
        pass.classList.add("invalid_input");
    }
    if (confirmPass.value != "") {
        if (confirmPass.value == pass.value) {
            confirmPass.classList.remove("invalid_input");
            errorConfirmPass.innerHTML = "&nbsp";

        } else {
            errorConfirmPass.innerHTML = "Password do not match"
            confirmPass.classList.add("invalid_input");
        }
    }
}, false);
confirmPass.addEventListener("input", function (event) {

    if (confirmPass.value == "") {
        errorConfirmPass.innerHTML = "&nbsp";
        confirmPass.classList.remove("invalid_input");
    } else if (confirmPass.validity.valid) {
        if (confirmPass.value == pass.value) {
            confirmPass.classList.remove("invalid_input");
            errorConfirmPass.innerHTML = "&nbsp";

        } else {
            errorConfirmPass.innerHTML = "Password do not match"
            confirmPass.classList.add("invalid_input");
        }

    } else {
        errorConfirmPass.innerHTML = "Confirm password must be 8 to 15 characters"
        confirmPass.classList.add("invalid_input");
    }
}, false);

formReg.addEventListener("input", function (event) {
    console.log("lol");
    buttonSubmit.disabled = true;
    buttonSubmit.classList.remove('clickable')
    if (login.validity.valid) {
        if (confirmPass.validity.valid) {
            if (confirmPass.value == pass.value) {
                if (userName.validity.valid) {
                    buttonSubmit.disabled = false;
                    buttonSubmit.classList.add('clickable')
                }
            }
        }

    }
});
