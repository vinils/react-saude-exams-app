# react-saude-exams-app
Saude Exams

docker build -t vinils/saude_exams_app .  <BR>
docker run -p 3000:3000 -it -d -e REACT_APP_DATA_POINT=192.168.15.35:8002/odata/v4 vinils/saude_exams_app
