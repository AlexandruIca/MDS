from typing import List, Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

import json

from log import logger
from database import Database

activated = 0
db: Database = Database('server.db')
app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.active_users: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

        for user in self.active_users:
            if websocket in self.active_users[user]:
                self.active_users[user].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    def add_active_user(self, user_id: int, websocket: WebSocket):
        if user_id not in self.active_users:
            self.active_users[user_id] = []

        self.active_users[user_id].append(websocket)

    async def send_to_relevant_users(self, conv_id: int, data: str):
        for user_list in db.get_users_for_group(conv_id):
            user: int = int(user_list[0])
            if user not in self.active_users:
                continue

            for connection in self.active_users[user]:
                await self.send_personal_message(data, connection)


manager = ConnectionManager()


@app.get("/activation/{id}", response_class=HTMLResponse)
async def activation():
    global activated
    activated = 1
    return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mail Confirmation</title>
        </head>
        <body>
            <h2 style="color: chocolate; text-align: center; margin-top: 25%; margin-bottom: 25%;">
                Your mail is confirmed. Enjoy the application!
            </h2>
        </body>
        </html>
        """


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            load_json = list(json.loads(data).values())
            if load_json[0] == "signin":
                email, password = load_json[1:]
                if db.check_user(email, password):
                    user_id = db.get_id_for_user(email)
                    _, first_name, last_name = db.get_user_info(user_id)

                    answer_json = {
                        "type": "signin",
                        "status": "ok",
                        "user_id": user_id,
                        "first_name": first_name,
                        "last_name": last_name,
                        "groups": []
                    }
                    user_id: int = db.get_id_for_user(email)

                    for group in db.get_groups_for_user(user_id):
                        convos = db.get_group_info(group)
                        answer_json["groups"].append(convos)

                    manager.add_active_user(user_id, websocket)
                    await manager.send_personal_message(json.dumps(answer_json), websocket)
                else:
                    answer_json = {"type": "signin", "status": "error"}
                    await manager.send_personal_message(json.dumps(answer_json), websocket)
            elif load_json[0] == "send-message":
                sender = load_json[1]  # 'from'
                conversation = int(load_json[2])  # 'to'
                text = load_json[3]  # 'text'
                user_id = db.get_id_for_user(sender)
                user_email, first_name, last_name = db.get_user_info(user_id)
                (msg_id, msg_date) = db.insert_message(user_id, conversation, text)
                user_name = user_email \
                    if not first_name or not last_name \
                    else f'{first_name} {last_name}'

                answer = {
                    "type": "receive-message",
                    "conversation": conversation,
                    "id": msg_id,
                    "sender": user_id,
                    "sender_email": user_email,
                    "sender_name": user_name,
                    "text": text,
                    "date": msg_date,
                }
                await manager.send_to_relevant_users(conversation, json.dumps(answer))
            elif load_json[0] == "users":
                users = []
                for user in db.each_user():
                    if user != load_json[1]:
                        users.append(user[1])
                await manager.send_personal_message(json.dumps({
                    "type": "getUsers",
                    "users": users
                }), websocket)
            elif load_json[0] == "start-conv":
                id_sender, email_talker, nume_conv = load_json[1:]

                id_talker = db.get_id_for_user(email_talker)
                id_conv, name = db.insert_conv(id_sender, id_talker, nume_conv)
                await manager.send_to_relevant_users(id_conv,
                                                     json.dumps({"type": "start-conv", "id": id_conv, "name": name}))
            elif load_json[0] == "get-messages":
                id_conv = load_json[1]
                lst = db.get_messages_for_group(id_conv)
                await manager.send_personal_message(json.dumps({"type": "load-mess", "mess": lst}), websocket)
            elif load_json[0] == "attachment":
                email, conversation, data = load_json[1:]
                message_id, file_data, sender_id, message_date = db.insert_file(email, conversation, data)
                await manager.send_to_relevant_users(conversation, json.dumps( {
                    "type": "receive-message",
                    "conversation": conversation,
                    "id": message_id,
                    "sender": sender_id,
                    "sender_email": email,
                    "sender_name": user_name,
                    "text": "",
                    "date": message_date,
                    "file": file_data
                }))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.websocket('/activated')
async def websocket_activation_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            load_json = list(json.loads(data).values())
            print(load_json)
            if load_json[0] == "signup" and not activated:
                answer_json = {"type": "signup", "status": ""}
                await manager.send_personal_message(json.dumps(answer_json), websocket)
            else:
                email, first, second, password = load_json[1:]
                if not db.check_user(email, password):
                    db.insert_user(email=email, first_name=first, last_name=second, password=password)
                    answer_json = {"type": "signup", "status": "ok"}
                    await manager.send_personal_message(json.dumps(answer_json), websocket)
                else:
                    answer_json = {"type": "signup", "status": ""}
                    await manager.send_personal_message(json.dumps(answer_json), websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.on_event('startup')
def startup_event():
    logger.info('Starting application, setting up database...')
    db.create_schema()


@app.on_event('shutdown')
def shutdown_event():
    logger.info('Shutting down, closing database connection...')
    db.shutdown()
