var ws = new WebSocket("ws://localhost:5634/ws")
var allUsers = []
var user = { id: 0, email: "", first_name: "", last_name: "" }
var currentConversation = { id: 0, name: "" }

ws.onopen = function () {
    console.log('Websocket opened!')
}

ws.onclose = function () {
    console.log('Websocket closed!')
}

function showMessage(message) {
    let msgDiv = document.createElement('div')

    let msgUser = document.createElement('b')
    msgUser.innerText = message.sender_name;

    let msgContent = document.createElement('p')
    msgContent.innerText = message.text

    let dateSeparator = document.createElement('hr')
    dateSeparator.style.display = 'block'
    dateSeparator.style.width = '100%'
    dateSeparator.style.height = '1px'
    dateSeparator.style.backgroundColor = 'black'
    dateSeparator.style.marginTop = '2px'

    let msgDate = document.createElement('i')
    msgDate.innerText = message.date

    msgDiv.setAttribute('data-messageId', message.id.toString())
    msgDiv.setAttribute('data-senderEmail', message.sender_email)
    msgDiv.appendChild(msgUser)
    msgDiv.appendChild(msgContent)
    msgDiv.appendChild(dateSeparator)
    msgDiv.appendChild(msgDate)

    if (message.sender_email !== user.email) {
        msgDiv.className = 'message received'
    }
    else {
        msgDiv.className = 'message sent'
    }

    document.getElementById('messages').appendChild(msgDiv)
    msgDiv.scrollIntoView(/* alignToTop: */ false)
}

function showMessages(groups) {
    for (let i = 0; i < groups.length; ++i) {
        let group = groups[i]

        if (i === 0) {
            currentConversation.id = group.groupId
            currentConversation.name = group.groupName
        }

        let groupsElem = document.getElementById('contacts')
        let newGroup = document.createElement('button')
        newGroup.innerText = group.groupName
        groupsElem.appendChild(newGroup)

        for (let j = 0; j < group.messages.length; ++j) {
            showMessage(group.messages[j])
        }
    }

    document.querySelector('#chatInfo > b').innerText = currentConversation.name
}

this.send = function (message, callback) {
    this.waitForConnection(function () {
        ws.send(JSON.stringify(message));
        if (typeof callback !== 'undefined') {
            callback();
        }
    }, 1000);
};

this.waitForConnection = function (callback, interval) {
    if (ws.readyState === 1) {
        callback();
    } else {
        var that = this;
        setTimeout(function () {
            that.waitForConnection(callback, interval);
        }, interval);
    }
};

function getFormattedName(email, first_name, last_name) {
    if (first_name.length === 0 && last_name.length === 0) {
        return email
    }

    return `${first_name} ${last_name}`
}

window.onload = function () {
    if (window.localStorage.getItem('mds_password') !== null) {
        this.send({
            "type": "signin",
            "email": window.localStorage.getItem('mds_email'),
            "password": window.localStorage.getItem('mds_password')
        })

        ws.onmessage = (msg) => {
            answer = JSON.parse(msg.data)
            console.log(answer)
            if (answer.type === "signin") {
                if (answer.status === "ok") {
                    user.id = answer.user_id
                    user.email = window.localStorage.getItem('mds_email')
                    user.first_name = answer.first_name
                    user.last_name = answer.last_name
                    document.querySelector('#menu > div > b').innerText = getFormattedName(
                        user.email, user.first_name, user.last_name)
                    showMessages(answer.groups)
                    this.send({ "type": "users", "except": user.email })
                } else {
                    alert("Autentificare nereusita!")
                }
            }
            if (answer.type === "signup") {
                if (answer.status === "ok") {
                    //cancelForm(formularSignUp)
                }
                else {
                    alert("Contul nu a putut fi creat!")
                }
            }
            if (answer.type === "receive-message") {
                if (answer.conversation === currentConversation.id) {
                    showMessage(answer)
                }
            }
            if (answer.type === "getUsers") {
                console.log(answer.users)
                allUsers = answer.users
            }
        };
    }
    else {
        window.location.replace('./index.html')
    }
}

document.getElementById('btn-send').addEventListener('click', () => {
    if (user.email.length > 0) {
        messageInput = document.getElementById('write')
        if (messageInput.value.length > 0) {
            this.send({
                'type': 'send-message',
                'from': user.email,
                'to': currentConversation.id,
                'text': messageInput.value
            })
            messageInput.value = ''
        }
    }
})

document.getElementById('write').addEventListener('keyup', (event) => {
    if (event.code === 'Enter') {
        document.getElementById('btn-send').click()
    }
})

document.getElementById('btn-logout').addEventListener('click', () => {
    window.localStorage.removeItem('mds_email')
    window.localStorage.removeItem('mds_password')
    window.location.replace('./index.html')
})
