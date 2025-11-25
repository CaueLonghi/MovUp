FROM python:3.10

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia app
COPY . .

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "root:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
