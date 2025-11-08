# Étape 1 : Builder
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Étape 2 : Serveur de production
FROM node:18-alpine

WORKDIR /app

# Installation de serve pour servir les fichiers statiques
RUN npm install -g serve

# Copie des fichiers buildés
COPY --from=builder /app/dist ./dist

# Exposition du port
EXPOSE $PORT

# Commande de démarrage avec le port Heroku
CMD ["sh", "-c", "serve -s dist -l $PORT"]
