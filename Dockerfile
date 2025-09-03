FROM node:24

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN corepack enable

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

ENV API_KEY_ZOTERO=""

RUN yarn
RUN yarn run build

EXPOSE 8000

CMD [ "yarn", "start-local" ]
