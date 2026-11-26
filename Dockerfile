# Image unique : API Express + fichiers du frontend (boutique + dashboard)
FROM node:22-alpine

WORKDIR /app/backend

# 1. Dépendances (couche mise en cache tant que package*.json ne change pas)
#    Réglages pour connexions lentes : moins de téléchargements en parallèle,
#    délais plus longs et nouvelles tentatives automatiques.
COPY backend/package*.json ./
RUN npm config set fetch-retries 5 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-timeout 600000 \
 && npm config set maxsockets 3

#    Jusqu'à 3 essais (les paquets déjà téléchargés restent en cache entre deux essais),
#    puis vérification : si un module manque, le build s'arrête avec une erreur claire.
RUN for essai in 1 2 3; do \
      npm ci --omit=dev --no-audit --no-fund && break; \
      echo "⚠️  npm ci a échoué (essai $essai/3), nouvel essai dans 10 s..."; \
      sleep 10; \
    done \
 && node -e "require('express'); require('mongoose'); require('cors'); console.log('✅ Dépendances installées')"

# 2. Code source
COPY backend/ ./
COPY frontend/ /app/frontend/

ENV NODE_ENV=production \
    PORT=3000

EXPOSE 3000
USER node

CMD ["node", "server.js"]
