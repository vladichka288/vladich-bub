
    let loginForm = document.getElementById("login-form");
    let inputLogin = document.getElementById("inputLogin");
    let inputPass = document.getElementById("inputPass");
    let errorPassInput = document.getElementById("errorPassInput");
    let errorLoginInput = document.getElementById("errorLoginInput");
    let buttonSubmit = document.getElementById("buttonSubmit");
    loginForm.addEventListener("input", function (event) {
        buttonSubmit.disabled = true;

        if (inputLogin.validity.valid) {
            errorLoginInput.innerHTML = "&nbsp";
        } else {
            errorLoginInput.innerHTML = "Login must be minimum 5  characters";
        }
        if (inputPass.validity.valid) {
            if (inputLogin.validity.valid && inputPass.value !="") {
                console.log("lol")
                buttonSubmit.disabled = false;
            }
            errorPassInput.innerHTML = "&nbsp";

        } else {
            errorPassInput.innerHTML = "Password must be minimum 8 characters";
        }
        


    }, false);
