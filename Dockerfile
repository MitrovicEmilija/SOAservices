# Izberemo osnovno sliko z Alpine različico Node.js za manjšo velikost
FROM node:18-alpine

# Nastavimo delovni imenik v kontejnerju
WORKDIR /usr/src/app

# Kopiramo package.json in package-lock.json najprej, da izkoristimo Docker caching
COPY package*.json ./

# Namestimo odvisnosti
RUN npm install --production

# Kopiramo preostalo kodo v delovni imenik
COPY . .

# Nastavimo okoljske spremenljivke (če je potrebno)
# ENV MONGO_URI="your_mongo_db_connection_string"

# Odprimo vrata, na katerih bo aplikacija poslušala
EXPOSE 3000

# Nastavimo ukaz za zagon aplikacije
CMD ["node", "index.js"]
