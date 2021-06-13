var ws = new WebSocket("ws://localhost:5634/ws")
var allUsers = []
var user = ""
var currentConversation = 0

/*
function showMessages(groups) {
    for (let i = 0; i < groups.length; ++i) {
        let group = groups[i]

        if (i === 0) {
            currentConversation = group.groupId
        }

        let groupsElem = document.getElementById('groups')
        let newGroup = document.createElement('div')
        newGroup.innerText = group.groupName
        groupsElem.appendChild(newGroup)

        for (let j = 0; j < group.messages.length; ++j) {
            let message = group.messages[j]
            let allMessages = document.getElementById('AllMessages')
            let msgDiv = document.createElement('div')
            msgDiv.innerText = message.text

            if (message.sender_email !== user) {
                msgDiv.className = 'message-others'
            }
            else {
                msgDiv.className = 'message-mine'
            }

            allMessages.appendChild(msgDiv)
        }
    }
}
*/

/*
function showMessage(message) {
    // message.conversation
    // message.sender
    // message.text
    let newMessage = document.createElement('div')
    newMessage.innerText = message.text

    if (message.sender_name !== user) {
        newMessage.className = 'message-others'
    }
    else {
        newMessage.className = 'message-mine'
    }

    document.getElementById('AllMessages').appendChild(newMessage)
}
*/

ws.onmessage = (msg) => {
    answer = JSON.parse(msg.data)
    console.log(answer)
    if (answer.type === "signin") {
        if (answer.status === "ok") {
            user = document.getElementById("emailLog").value
            cancelForm(formularSignIn)
            document.getElementById("signin").style.display = "none"
            document.getElementById("signup").style.display = "none"
            // document.getElementById("log-out").style.display = "block"
            // showMessages(answer.groups)
            ws.send(JSON.stringify({ "type": "users", "except": user }))
            window.localStorage.setItem('mds_password', window.localStorage.getItem('mds_try_password'))
            window.location.replace("./chat.html")
            ws.close()
        } else {
            alert("Autentificare nereusita!")
        }
    }
    if (answer.type === "receive-message") {
        if (answer.conversation === currentConversation) {
            // showMessage(answer)
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

/*
document.getElementById("btn-send").addEventListener("click", () => {
    if (user.length > 0) {
        ws.send(JSON.stringify({
            'type': 'send-message',
            'from': user,
            'to': currentConversation,
            'text': document.getElementById('send-message').value
        }));
    }
})
*/

/*
document.getElementById("log-out").addEventListener("click", () => {
    user = ""
    document.getElementById("signin").style.display = "block"
    document.getElementById("signup").style.display = "block"
    document.getElementById("log-out").style.display = "none"
    document.getElementById('groups').innerHTML = ""
    document.getElementById('AllMessages').innerHTML = ""
})*/