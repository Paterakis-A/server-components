export const dockerComposeContent: any = `
version: '3.8'

services:
  app:
    build: .
    container_name: server
    image: server:latest
    ports:
      - "7000:7000"
    environment:
      - NODE_ENV=development
    restart: unless-stopped
`;
