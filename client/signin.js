const formularSignIn = document.getElementById('formularSignIn')


document.getElementById("log-out").addEventListener("click", () => {
    user = ""
    document.getElementById("signin").style.display = "block"
    document.getElementById("signup").style.display = "block"
    document.getElementById("log-out").style.display = "none"
})

document.getElementById("logAcc").addEventListener("click", () => {
    const emailLog = document.getElementById("emailLog").value
    const passLog = document.getElementById("passLog").value 
    
    if (emailLog == '' || passLog == ''){
        alert("Te rugam sa completezi datele de autentificare!")
    }
    else{
        let d = {
            "Status": "signin",
            "Email": emailLog,
            "Password": passLog
        }
        ws.send(JSON.stringify(d))
    }
})