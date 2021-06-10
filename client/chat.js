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

    let msgDate = document.createElement('i')
    msgDate.innerText = message.date

    msgDiv.setAttribute('data-messageId', message.id.toString())
    msgDiv.appendChild(msgUser)
    msgDiv.appendChild(msgContent)
    msgDiv.appendChild(msgDate)

    if (message.sender_email !== user.email) {
        msgDiv.className = 'message received'
    }
    else {
        msgDiv.className = 'message sent'
    }

    document.getElementById('messages').appendChild(msgDiv)
}

function showMessages(groups) {
    for (let i = 0; i < groups.length; ++i) {
        let group = groups[i]

        if (i === 0) {
            currentConversation.id = group.groupId
        }

        let groupsElem = document.getElementById('contacts')
        let newGroup = document.createElement('button')
        newGroup.innerText = group.groupName
        groupsElem.appendChild(newGroup)

        for (let j = 0; j < group.messages.length; ++j) {
            showMessage(group.messages[j])
        }
    }
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
}

document.getElementById('btn-send').addEventListener('click', () => {
    if (user.email.length > 0) {
        document.getElementById('write').text
        this.send({
            'type': 'send-message',
            'from': user.email,
            'to': currentConversation.id,
            'text': document.getElementById('write').value
        })
    }
})
