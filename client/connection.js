var ws = new WebSocket("ws://localhost:5634/ws")
var user = ""


ws.onmessage = (msg) => {
    answer = JSON.parse(msg.data)
    console.log(answer)
    if (answer.type == "signin"){
        if (answer.status == "ok"){
            user = document.getElementById("emailLog").value
            console.log(user)
            cancelForm(formularSignIn)
            document.getElementById("signin").style.display = "none"
            document.getElementById("signup").style.display = "none"
            document.getElementById("log-out").style.display = "block"
        }else{
            alert("Autentificare nereusita!")
        }
    }
    if (answer.type == "signup"){
        if (answer.status == "ok"){
            cancelForm(formularSignUp)
        }
        else{
            alert("Contul nu a putut fi creat!")
        }
    }
}

showForm = function(formular){
    formular.style.visibility = "visible"
    formular.style.width = "100%"
    formular.style.height = "100%"
    formular.style.display = "grid"
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