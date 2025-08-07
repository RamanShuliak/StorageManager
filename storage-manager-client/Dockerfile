FROM node:18 AS build

WORKDIR /app

ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app/build .

RUN npm install -g serve

EXPOSE 80

CMD ["serve", "-s", ".", "-l", "80"]
