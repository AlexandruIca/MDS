import tornado
import tornado.options
import tornado.ioloop
import tornado.websocket

import sqlite3

from log import logger

tornado.options.define('port', default=5634,
                       help='Specify port to listen to', type=int)
tornado.options.define('debug', default=True, help='Run in debug mode')

config = tornado.options.options

db = sqlite3.connect('server.db')
db_cursor = db.cursor()

db_cursor.execute('CREATE TABLE IF NOT EXISTS messages(content text)')


class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin) -> bool:
        return True

    def open(self):
        logger.info('New connection!')
        to_send: str = ''

        for row in db_cursor.execute('SELECT content FROM messages'):
            to_send += f'{row[0]}\n'

        self.write_message(to_send)

    def on_message(self, message):
        logger.info(f'Message received: {message}')
        db_cursor.execute('INSERT INTO messages VALUES(?)', (message,))
        db.commit()

    def on_close(self):
        logger.info('Connection closed!')


def main():
    app = tornado.web.Application([(r'/ws', WSHandler)])
    app.listen(config.port)
    tornado.ioloop.IOLoop.current().start()
    db.close()


if __name__ == '__main__':
    main()
