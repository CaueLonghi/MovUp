# AI - Python API
FROM python:3.10

# Diretório da aplicação
WORKDIR /app

# Copia dependências
COPY requirements.txt .

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante da aplicação
COPY . .

# Porta usada pela API
EXPOSE 8000

# Comando para rodar a API
CMD ["python", "-m", "uvicorn", "root:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
