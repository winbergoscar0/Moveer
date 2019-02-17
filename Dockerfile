FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY config.js ./
RUN npm install

# Bundle app source
COPY . .

CMD [ "npm", "start" ]
