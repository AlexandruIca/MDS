const formularSignIn = document.getElementById('formularSignIn')
const formularSignUp = document.getElementById('formularSignUp')

let validations = [
    [document.getElementById("email"), document.getElementById("email_validation"), new RegExp(/^[a-zA-z0-9_-]+(\.[a-zA-z0-9_-]+)*@([a-zA-Z0-9]+\.)+[a-zA-Z]+$/)],
    [document.getElementById("fst"), document.getElementById("fst_validation"), new RegExp(/^[A-Z][a-z]+(-[A-Z][a-z]+)*$/)],
    [document.getElementById("snd"), document.getElementById("snd_validation"), new RegExp(/^[A-Z][a-z]+(-[A-Z][a-z]+)*$/)],
    [document.getElementById("pass"), document.getElementById("pass_validation"), new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[?!._-])[a-zA-Z0-9?!._-]+$/)],
]

validations.forEach((el) => {
    el[0].addEventListener("input", () => {
        if (!el[0].value || el[2].test(el[0].value))
            el[1].style.visibility = "hidden";
        else
            el[1].style.visibility = "visible";
    })
})

document.getElementById("cpass").addEventListener("input", () => {
    if (!document.getElementById("cpass").value || document.getElementById("cpass").value == document.getElementById("pass").value)
        document.getElementById("cpass_validation").style.visibility = "hidden";
    else
        document.getElementById("cpass_validation").style.visibility = "visible";
})


var ws = new WebSocket("ws://localhost:5634/ws")
document.getElementById('create').addEventListener("click", () => {
    let d = {
        "Email": validations[0][0].value,
        "Fst": validations[1][0].value,
        "Snd": validations[2][0].value,
        "Password": validations[3][0].value
    }
    ws.send(JSON.stringify(d))
})


showForm = function(formular){
    formular.style.visibility = "visible"
    formular.style.width = "100%"
    formular.style.height = "100%"
    formular.style.display = "grid"
    formular.style.alignItems = "center"
    formular.style.gridTemplateColumns = "auto auto"
    formular.style.gridTemplateColumns = "auto auto"
    formular.style.backgroundColor = "rgba(0, 0, 0, 0.6)"
}

cancelForm = function(formular){
    formular.style.visibility = "hidden"
    formular.style.display = "none"
}

document.getElementById("signin").addEventListener("click", () => {
    showForm(formularSignIn)
})

document.getElementById("signup").addEventListener("click", () => {
    showForm(formularSignUp)
})

document.getElementById("form-cancel-signin").addEventListener("click", () => {
    cancelForm(formularSignIn)
})

document.getElementById("form-cancel-signup").addEventListener("click", () => {
    cancelForm(formularSignUp)
})
