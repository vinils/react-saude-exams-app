FROM stefanscherer/node-windows:latest

WORKDIR /usr/app

COPY ./package*.json ./
RUN npm install

COPY . .
RUN npm build

EXPOSE 3000

CMD npm run start

#docker build -t vinils/saude_exams_app .
#docker run -p 3000:3000 -it -d -e DATA_POINT=192.168.15.35:8002/odata/v4 vinils/saude_exams_app