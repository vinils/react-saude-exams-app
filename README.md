# react-saude-exams-app
Saude Exams

[![CircleCI](https://circleci.com/gh/vinils/react-saude-exams-app.svg?style=svg)](https://circleci.com/gh/vinils/react-saude-exams-app)
[![Docker Pulls](https://img.shields.io/docker/pulls/vinils/react-saude-exams-app.svg)](https://hub.docker.com/r/vinils/react-saude-exams-app)
[![Docker Stars](https://img.shields.io/docker/stars/vinils/react-saude-exams-app.svg)](https://hub.docker.com/r/vinils/react-saude-exams-app)
<a href="https://hub.docker.com/r/vinils/react-saude-exams-app/builds" target="_blank">Docker Builds</a>

docker build -t vinils/react-saude-exams-app .  
docker run -p 3000:3000 -it -d -e REACT_APP_DATA_POINT=192.168.15.35:8002/odata/v4 vinils/react-saude-exams-app  
