# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Final Image
FROM python:3.11-slim
WORKDIR /app

# Install Backend Dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ .

# Copy Frontend Build to serve (Optional: If using FastAPI to serve static files)
# For simplicity, we usually run them separately in Compose, but here is the backend setup
COPY --from=frontend-builder /app/frontend/.next /app/frontend/.next

EXPOSE 8000
CMD ["python", "main.py"]