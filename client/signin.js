const searchUser = document.getElementById("search-user")
const usersDiv = document.getElementById("show-users")
const formularSignIn = document.getElementById('formularSignIn')


document.getElementById("logAcc").addEventListener("click", () => {
    const emailLog = document.getElementById("emailLog").value
    const passLog = document.getElementById("passLog").value

    if (emailLog == '' || passLog == '') {
        alert("Te rugam sa completezi datele de autentificare!")
    }
    else {
        window.localStorage.setItem('mds_try_password', passLog)
        window.localStorage.setItem('mds_email', emailLog)

        let d = {
            "Status": "signin",
            "Email": emailLog,
            "Password": passLog
        }
        ws.send(JSON.stringify(d))
    }
})

/*
searchUser.addEventListener("input", () => {
    usersDiv.innerText = ""

    allUsers.forEach(i => {
        if (i.includes(searchUser.value)){
            newUser = document.createElement("div")
            newUser.innerText = i
            usersDiv.appendChild(newUser)
        }
    })
})*/