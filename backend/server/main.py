import tornado
import tornado.options
import tornado.ioloop
import tornado.websocket

from log import logger

tornado.options.define('port', default=5634,
                       help='Specify port to listen to', type=int)
tornado.options.define('debug', default=True, help='Run in debug mode')

config = tornado.options.options


class WSHandler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin) -> bool:
        return True

    def open(self):
        logger.info('New connection!')
        self.write_message('Hello World!')

    def on_message(self, message):
        logger.info(f'Message received: {message}')

    def on_close(self):
        logger.info('Connection closed!')


def main():
    app = tornado.web.Application([(r'/ws', WSHandler)])
    app.listen(config.port)
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    main()
