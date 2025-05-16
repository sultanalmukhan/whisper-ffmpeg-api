FROM node:18

RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip
RUN pip3 install openai-whisper

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]

