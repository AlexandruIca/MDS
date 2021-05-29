import sqlite3
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect

import json

from log import logger
from database import Database

db: Database = Database('server.db')
app = FastAPI()


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await manager.send_personal_message('To be sent!', websocket)

    # conn = sqlite3.connect('server.db')
    # cur = conn.cursor()
    # cur.execute("SELECT * FROM users")
    # rows = cur.fetchall()
    # print(rows)
    try:
        while True:
            data = await websocket.receive_text()
            load_json = list(json.loads(data).values())
            print(load_json)
            if load_json[0] == 200:
                email, password = load_json[1:]
                for row in db.each_user():
                    print(row)
                    if row[1] == email:
                        print('yes')
                        break
            else:
                email, first, second, password = load_json[1:]
                db.insert_user(email=email, first_name=first, last_name=second, password=password)
                for row in db.each_user():
                    print(row)

            #await manager.send_personal_message('Succesful 1', websocket)
            #await manager.send_personal_message(f'You wrote: {data}', websocket)
            await manager.broadcast(f'Somebody said: {data}')
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
