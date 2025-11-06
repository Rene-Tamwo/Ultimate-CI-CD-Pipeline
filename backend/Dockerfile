# Étape 1 : Builder et test
FROM node:18-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./
RUN npm ci

# Copie du code source
COPY . .

# Étape 2 : Runner final
FROM node:18-alpine AS runner

WORKDIR /app

# Installation de curl pour le healthcheck
RUN apk add --no-cache curl

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copie des node_modules et du code depuis le builder
COPY --from=builder --chown=nextjs:nodejs /app ./

# Passage à l'utilisateur non-root
USER nextjs

# Exposition du port
EXPOSE 3000

# Healthcheck (essentiel pour Docker et Kubernetes)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Commande de démarrage
CMD ["npm", "start"]
