var ws = new WebSocket("ws://localhost:5634/ws")
const formularSignIn = document.getElementById('formularSignIn')

document.getElementById("logAcc").addEventListener("click", () => {
    const emailLog = document.getElementById("emailLog").value
    const passLog = document.getElementById("passLog").value 
    
    if (emailLog == '' || passLog == ''){
        alert("Te rugam sa completezi datele de autentificare!")
    }
    else{
        let d = {
            "Status": 200,
            "Email": emailLog,
            "Password": passLog
        }
        ws.send(JSON.stringify(d))
    }
})

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