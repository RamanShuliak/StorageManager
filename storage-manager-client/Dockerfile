########################################
# 1. Сборка React-приложения
########################################
FROM node:18 AS build

WORKDIR /app

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

########################################
# 2. Отдача статики без Nginx
########################################
FROM node:18-alpine AS runtime

WORKDIR /app

# Берём готовый билд
COPY --from=build /app/build .

# Устанавливаем утилиту serve
RUN npm install -g serve

EXPOSE 80

# Однострочный SPA-сервер
CMD ["serve", "-s", ".", "-l", "80"]
