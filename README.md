[![StaticAnalysis](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/StaticAnalysis.yml)
[![Testing](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml/badge.svg)](https://github.com/AlexandruIca/MDS/actions/workflows/Testing.yml)
---
# Real Time Messaging

## Running the server

Make sure you have [poetry](https://python-poetry.org/) installed, after that:
```sh
cd backend/

poetry install

../scripts/uvicorn.sh
```
Once the server is running you can open [client/index.html](client/index.html) in a browser and the connection should
be established.
