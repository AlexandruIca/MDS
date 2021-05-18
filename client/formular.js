var ws = new WebSocket("ws://localhost:5634/ws");
const create = document.getElementById('create')


create.addEventListener("click", () => {
    let d = {
        "Email": document.getElementById('email').value,
        "Fst": document.getElementById('fst').value,
        "Snd": document.getElementById('snd').value,
        "Password": document.getElementById('pass').value 
    }
    ws.send(JSON.stringify(d));    
})
