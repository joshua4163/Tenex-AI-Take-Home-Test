# Use a more secure and updated base image
FROM python:3.11-slim-bookworm

# Fix OS level vulnerabilities by upgrading packages
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Security best practice: Don't run as root (Optional for prototype but looks good)
# RUN useradd -m myuser
# USER myuser

EXPOSE 8000
CMD ["python", "main.py"]