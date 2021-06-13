const activationWs = new WebSocket("ws://localhost:5634/activated")
const formularSignUp = document.getElementById('formularSignUp')
const emailSender = "chat_app@yahoo.com"


activationWs.onmessage = (msg) => {   
    answer = JSON.parse(msg.data) 
    if (answer.type === "signup") {
        if (answer.status === "ok") {
            cancelForm(formularSignUp)
        }
        else {
            alert("Your account couldn't be created!")
        }
    }
}

function generate_otp() {
    var digits = '0123456789'
    let OTP = ''
    for (let i = 0; i < 4; i++) {
        OTP += digits[Math.floor(Math.random() * 10)]
    }
    return OTP
}

function send_Yahoo_Email(destination) {
    Email.send({
      Host: "smtp.mail.yahoo.com",
      Username: emailSender,
      Password: "xkvqgljgsxdmfuvk",
      To: destination,
      From: emailSender,
      Subject: "Email confirmation",
      Body: "http://localhost:5634/activation/" + generate_otp(),
    })
}

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


document.getElementById('createAcc').addEventListener("click", async () => {
    send_Yahoo_Email(document.getElementById("email").value)
    let func = () => {
        activationWs.send(JSON.stringify({
            "Status": "signup", 
            "Email": validations[0][0].value,
            "Fst": validations[1][0].value,
            "Snd": validations[2][0].value,
            "Password": validations[3][0].value
        }))
    }
    setTimeout(func, 40000)
    alert("Please confirm your mail. You have 40 seconds to proceed!")
})