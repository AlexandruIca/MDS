const formularSignIn = document.getElementById('formularSignIn')

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