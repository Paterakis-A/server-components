export const dockerFileContent = `
FROM node:22

WORKDIR /src

RUN mkdir -p /src/dummy_uploads /src/uploads

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build:dev

EXPOSE 7000

CMD [ "node", "staging/app.js" ]
`;
