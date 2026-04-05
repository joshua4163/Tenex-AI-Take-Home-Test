# Use Alpine for minimal footprint
FROM node:20-alpine

# Update alpine packages
RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN npm install --frozen-lockfile

COPY . .
RUN npm run build

# Production-ready serving (Optional: simple npm start is fine for functionality)
EXPOSE 3000
CMD ["npm", "start"]