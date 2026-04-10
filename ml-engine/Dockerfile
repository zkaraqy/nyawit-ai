# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the ML engine code
COPY . .

# Tell Cloud Run which port we expect
ENV PORT=8080

# Run Uvicorn, forcing it to listen on 0.0.0.0 and the PORT variable
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]