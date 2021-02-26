import logging

logger = logging.getLogger('logger')
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

file_handler = logging.FileHandler(filename='server_log.txt')
file_handler.setLevel(logging.DEBUG)

formatter = logging.Formatter('[%(asctime)s - %(name)s - %(levelname)s]: %(message)s')

console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)
