var ws = new WebSocket("ws://localhost:5634/ws")
var allUsers = []
var user = { id: 0, email: "", first_name: "", last_name: "" }
var currentConversation = { id: 0, name: "" }
const usersDiv = document.getElementById('search_users')
const searchUser = document.getElementById('s_group')

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
    if (message.text.length === 0) {
        msgContent.innerText = message.file
    }
    else {
        msgContent.innerText = message.text
    }

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

    if (message.sender_email === user.email && message.text !== '(Message deleted)') {
        let deleteButton = document.createElement('button')
        deleteButton.style.width = '30px'
        deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-trash" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="#2c3e50" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                  <line x1="4" y1="7" x2="20" y2="7" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                  <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                  <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                  </svg>`

        deleteButton.addEventListener("click", function (e) {
            //console.log(e.target.parentElement.parentElement)
            ws.send(JSON.stringify({ "type": "delete-mess", "id-mess": e.target.parentElement.parentElement.dataset.messageid }))
        })
        msgDiv.appendChild(deleteButton)
    }

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

            for (let j = 0; j < group.messages.length; ++j) {
                showMessage(group.messages[j])
            }
        }

        let groupsElem = document.getElementById('contacts')
        let newGroup = document.createElement('button')
        newGroup.innerText = group.groupName
        newGroup.setAttribute("data-conversationId", groups[i].groupId)
        newGroup.addEventListener("click", () => {
            let messages = document.getElementById("messages")
            messages.innerHTML = ""
            newGroup.innerHTML = groups[i].groupName
            currentConversation.id = groups[i].groupId
            currentConversation.name = groups[i].groupName
            document.querySelector('#chatInfo > b').innerText = currentConversation.name
            this.send({ "type": "get-messages", "idConv": currentConversation.id })
        })
        groupsElem.appendChild(newGroup)
    }
    document.querySelector('#chatInfo > b').innerText = currentConversation.name
}

function getUserName(mail) {
    return mail.substring(0, mail.indexOf("@"))
}

searchUser.addEventListener("input", () => {
    usersDiv.style.display = "block"
    usersDiv.innerText = ""

    allUsers.forEach(i => {
        if (i.includes(searchUser.value) && i !== user.email) {
            newUser = document.createElement("button")
            newUser.innerText = i
            newUser.style = "cursor: pointer"
            newUser.setAttribute('data-userEmail', newUser.innerText)
            newUser.addEventListener('click', (e) => {
                this.send({ "type": "start-conv", "me": user.id, "with": e.target.dataset.useremail, "name": `${getUserName(e.target.dataset.useremail)}_${getUserName(user.email)}` })
            })
            usersDiv.appendChild(newUser)
        }
    })
    if (searchUser.value === "") {
        usersDiv.style.display = "none"
    }
})

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

function printConv(data) {
    conv_name_btn = document.createElement('button')
    conv_name_btn.innerText = data.name
    conv_name_btn.setAttribute("data-conversationId", data.id)
    document.getElementById('contacts').appendChild(conv_name_btn)

    conv_name_btn.addEventListener('click', () => {
        let messages = document.getElementById("messages")
        messages.innerHTML = ""
        currentConversation.id = data.id
        currentConversation.name = data.name
        document.querySelector('#chatInfo > b').innerText = currentConversation.name
        this.send({ "type": "get-messages", "idConv": currentConversation.id })
    })
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
            //console.log(answer)
            console.log(answer.type)
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
            if (answer.type === "receive-message") {
                console.log("orice")
                if (answer.conversation === currentConversation.id) {
                    showMessage(answer)
                }
                else {
                    boldd = document.createElement('b')
                    boldd.innerText = "*"
                    boldd.style.color = "red"
                    document.querySelector(`#contacts > button[data-conversationId="${answer.conversation}"]`).appendChild(boldd)
                }
            }
            if (answer.type === "getUsers") {
                console.log(answer.users)
                allUsers = answer.users
            }
            if (answer.type === "start-conv") {
                printConv(answer)
            }
            if (answer.type === "load-mess") {
                for (let i = 0; i < answer.mess.length; i++) {
                    showMessage(answer.mess[i])
                }
            }
            if (answer.type === "delete-message") {
                console.log("asdafasdgasdgasdg")
                console.log(answer)
                document.querySelector(`#messages > div[data-messageId="${answer.messId}"] > p`).innerText = '(Message deleted)'
            } else {
                console.log(answer)
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

let f = document.getElementById('myfile')

function uploadFile() {
    let file = f.files[0];

    if (!file) {
        return
    }

    if (file.size > 10000000) {
        alert('File should be smaller than 1MB')
        return
    }

    var reader = new FileReader();
    var rawData = new ArrayBuffer();

    reader.onload = function (e) {
        rawData = e.target.result;
        console.log("Ceva");
        ws.send({
            type: 'attachment',
            email: user.email,
            conversation: currentConversation.id,
            data: rawData
        }, (result) => {
            alert("Server has received file!")
        });

        alert("the File has been transferred.")
    }

    reader.readAsArrayBuffer(file);
}
