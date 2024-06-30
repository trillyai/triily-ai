# Use the official Node.js image from the Docker Hub as the base image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the dependencies including node-fetch
RUN npm install

# Install node-fetch explicitly
RUN npm install node-fetch

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the environment variable for production
ENV NODE_ENV=production

# Command to run the application
CMD ["node", "index.js"]

# docker build -f ./docker/Dockerfile -t mehmetali10/trilly-ai .
# docker push mehmetali10/trilly-ai
# docker run -p 8000:8000 mehmetali10/trilly-ai