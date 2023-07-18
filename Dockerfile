## build runner
FROM --platform=linux/amd64 node:18.16.1 as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY tsconfig.json   .

# Build project
RUN npm run build

## producation runner
FROM --platform=linux/amd64 node:18.16.1 as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --only=production

# Move build files
COPY --from=build-runner /tmp/app/build /app/build

# Import args from docker-compose
ARG NODE_ENV=$NODE_ENV
ARG BOT_CLIENT_ID=$BOT_CLIENT_ID
ARG BOT_TOKEN=$BOT_TOKEN

# Run deploy command
RUN NODE_ENV=${NODE_ENV} BOT_TOKEN=${BOT_TOKEN} BOT_CLIENT_ID=${BOT_CLIENT_ID} npm run update-commands

# Start bot
CMD [ "node", "build/sharding.js" ]
