# Base image for the container
FROM node:20.17.0

# Copy files and install dependencies
WORKDIR /app/
COPY . ./

RUN npx prisma generate

#For debugging: create and write the contents of start.sh in the container
RUN rm start.sh
RUN echo "#!/bin/bash" >> start.sh && \
    echo "# push the schema to the database and sync the client" >> start.sh && \
    echo "npx prisma db push --schema='/usr/src/app/prisma/schema.prisma' --skip-generate " >> start.sh && \
    echo "" >> start.sh

# Set execute permissions for the start.sh script.
RUN chmod +x ./start.sh

RUN npm run build

# Run in dev mode, `npm run serve` for production
CMD ["npm", "run", "serve", "--no-update-notifier", "--max-old-space-size=50"]
