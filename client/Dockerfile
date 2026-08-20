FROM node:20-alpine

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./
## We separated the package.json and package-lock.json to take advantage of cached Docker layers. This way, we only need to re-run npm install when these files change.

CMD ["npm","run","dev"]