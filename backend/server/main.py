from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from log import logger

import sqlite3

db = sqlite3.connect('server.db')
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


def insert_message(msg: str):
    db_cursor = db.cursor()
    db_cursor.execute('INSERT INTO messages(content) VALUES(?)', (msg,))
    db.commit()


@app.websocket('/ws')
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    await manager.send_personal_message('To be sent!', websocket)

    try:
        while True:
            data = await websocket.receive_text()
            insert_message(f'{data}')
            await manager.send_personal_message(f'You wrote: {data}', websocket)
            await manager.broadcast(f'Somebody said: {data}')
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast('Somebody disconnected!')


@app.on_event('startup')
def startup_event():
    logger.info('Starting application, setting up database...')
    cursor = db.cursor()
    cursor.execute('CREATE TABLE IF NOT EXISTS messages(content text)')
    db.commit()


@app.on_event('shutdown')
def shutdown_event():
    logger.info('Shutting down, closing database connection...')
    db.close()
