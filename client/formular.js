var ws = new WebSocket("ws://localhost:5634/ws");
const email = document.getElementById('email')
const fst = document.getElementById('fst')
const snd = document.getElementById('snd')
const password = document.getElementById('pass')
const create = document.getElementById('create')
let verifEmail, verifPassword = 0

email.addEventListener("input", () => {
    const mailRegex = new RegExp('^([a-z]+[_0-9]*)+@[a-z]+(\.[a-z]+)+$')
    const mailShow = document.getElementById('mailShow')
    if(email.value)
    {
        if(mailRegex.test(email.value)) 
        {
            email.style.borderColor = "green"
            verifEmail = 1
            mailShow.innerHTML = 'GOOD'
        }
        else 
        {
            email.style.borderColor = "red"
            verifEmail = 0
            mailShow.innerHTML = 'YOUR EMAIL SHOUD NOT BE LIKE THAT'
        }
    }
    else 
        {
            email.style.borderColor = "inherit"
            mailShow.innerHTML = ''
        }
})


// password.addEventListener("input", () => {
//     const passRegex = new RegExp('^[A-Z]{1}[a-z0-9][\#\!\*]+$')
//     const passShow = document.getElementById('passShow')
//     if(password.value)
//     {
//         if(passRegex.test(password.value)) 
//         {
//             password.style.borderColor = "green"
//             passShow.innerHTML = 'GOOD'  
//             verifPassword = 1
//         }
//         else 
//         {
//             password.style.borderColor = "red"
//             passShow.innerHTML = 'YOUR PASSWORD SHOULD CONTAIN AN UPPERCASE LETTER FOLLOWED BY SMALL LETTERS OR NUMBERS ENDING WITH ONE OF THESE SYMBOLS [#!*]'
//             verifPassword = 0
//         }
//     }
//     else 
//         {
//             password.style.borderColor = "inherit"
//             passShow.innerHTML = ''
//         }
// })

create.addEventListener("click", () => {
    let d = {
        "Email": email.value,
        "Fst": fst.value,
        "Snd": snd.value,
        "Password": pass.value 
    }
    if(verifEmail){
        ws.send(JSON.stringify(d));    
    }else{
        alert("Verifica datele")
    }
})
