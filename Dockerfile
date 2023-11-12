FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN yarn install

# Bundle app source
COPY src ./src
COPY server ./server
COPY README.md ./
COPY config ./config
COPY scripts ./scripts
COPY public ./public

COPY .eslintrc ./.eslintrc
COPY .prettierrc ./.prettierrc
COPY .eslintignore ./.eslintignore

COPY .cache ./.cache

EXPOSE 8000

CMD [ "npm", "start-local" ]
