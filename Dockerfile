# Use the official Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file from the root
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire API application code and necessary config files
COPY core ./core
COPY services ./services
COPY ml ./ml
COPY alembic ./alembic
COPY scripts ./scripts
COPY data ./data
COPY alembic.ini .
COPY config.yaml .
COPY umbrella.py .


# Set PYTHONPATH so Python can find the modules
ENV PYTHONPATH=/app

# Expose default port
EXPOSE 8000

# Run the FastAPI server using Uvicorn with dynamic $PORT support for Render
CMD ["sh", "-c", "uvicorn services.api.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
