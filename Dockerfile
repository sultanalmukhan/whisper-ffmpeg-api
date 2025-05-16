FROM node:18

# Установка зависимостей
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    python3-pip \
    python3-venv

# Создаём виртуальное окружение
RUN python3 -m venv /opt/venv

# Активируем виртуальное окружение и устанавливаем Whisper
RUN /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install openai-whisper

# Добавляем путь Python в переменные среды
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
