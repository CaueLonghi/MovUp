# Setup Rápido do Banco de Dados

## Método Mais Rápido: Docker

### 1. Instalar Docker Desktop
- Baixe em: https://www.docker.com/products/docker-desktop
- Instale e reinicie o PC

### 2. Criar Container MySQL
```powershell
docker run --name movup-mysql -e MYSQL_ROOT_PASSWORD=movup123 -e MYSQL_DATABASE=movup -p 3306:3306 -d mysql:8.0
```

### 3. Criar arquivo .env
Na pasta `Backend`, crie um arquivo `.env`:
```env
DATABASE_URL="mysql://root:movup123@localhost:3306/movup"
```

### 4. Configurar Prisma
```powershell
cd Backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

Pronto! O banco está configurado.

---

## Método Alternativo: MySQL Local

### 1. Instalar MySQL
- Baixe: https://dev.mysql.com/downloads/installer/
- Instale e anote a senha do root

### 2. Criar Banco de Dados
Abra MySQL Command Line ou Workbench e execute:
```sql
CREATE DATABASE movup;
```

### 3. Criar arquivo .env
Na pasta `Backend`, crie um arquivo `.env`:
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/movup"
```

### 4. Configurar Prisma
```powershell
cd Backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

---

## Verificar se Funcionou

Execute:
```powershell
npx prisma studio
```

Se abrir uma interface web, está tudo certo!

