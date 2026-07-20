FROM node:20-alpine

WORKDIR /app

COPY ai-learning-assistant/package*.json ./

RUN npm install

COPY ai-learning-assistant/ ./

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
