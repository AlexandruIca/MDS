var ws = new WebSocket("ws://localhost:5634/ws")
var allUsers = []
var user = ""
var currentConversation = 0

ws.onmessage = (msg) => {
    answer = JSON.parse(msg.data)
    console.log(answer)
    if (answer.type === "signin") {
        if (answer.status === "ok") {
            user = document.getElementById("emailLog").value
            document.getElementById("signin").style.display = "none"
            document.getElementById("signup").style.display = "none"
            ws.send(JSON.stringify({ "type": "users", "except": user }))
            window.localStorage.setItem('mds_password', window.localStorage.getItem('mds_try_password'))
            window.location.replace("./chat.html")
            ws.close()
        } else {
            alert("Autentificare nereusita!")
        }
    }
    if (answer.type === "getUsers") {
        console.log(answer.users)
        allUsers = answer.users
    }
}

document.getElementById("signin").addEventListener("click", () => {
    formularSignIn.style.display = "grid"
})

document.getElementById("signup").addEventListener("click", () => {
    formularSignUp.style.display = "grid"
})

document.getElementById("form-cancel-signin").addEventListener("click", () => {
    formularSignIn.style.display = "none"
})

document.getElementById("form-cancel-signup").addEventListener("click", () => {
    formularSignUp.style.display = "none"
})