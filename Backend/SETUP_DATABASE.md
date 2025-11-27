# Guia de Configuração do Banco de Dados MySQL no Windows

Este guia irá ajudá-lo a instalar e configurar o MySQL no Windows para o projeto MovUp.

## Opção 1: Instalar MySQL diretamente no Windows

### Passo 1: Baixar MySQL

1. Acesse: https://dev.mysql.com/downloads/installer/
2. Baixe o **MySQL Installer for Windows** (recomendado: versão completa)
3. Execute o instalador

### Passo 2: Instalar MySQL

1. Escolha **"Developer Default"** ou **"Server only"**
2. Siga o assistente de instalação
3. **IMPORTANTE**: Anote a senha do usuário `root` que você configurar
4. Complete a instalação

### Passo 3: Verificar Instalação

Abra o **MySQL Command Line Client** ou **MySQL Workbench** e teste a conexão.

## Opção 2: Usar Docker (Recomendado - Mais Fácil)

### Passo 1: Instalar Docker Desktop

1. Baixe Docker Desktop para Windows: https://www.docker.com/products/docker-desktop
2. Instale e reinicie o computador
3. Inicie o Docker Desktop

### Passo 2: Criar Container MySQL

Execute no PowerShell (na raiz do projeto):

```powershell
docker run --name movup-mysql -e MYSQL_ROOT_PASSWORD=senha123 -e MYSQL_DATABASE=movup -p 3306:3306 -d mysql:8.0
```

**Substitua `senha123` pela senha que você deseja usar.**

### Passo 3: Verificar se está rodando

```powershell
docker ps
```

Você deve ver o container `movup-mysql` rodando.

## Configuração do Projeto

### Passo 1: Criar arquivo .env

Crie um arquivo `.env` na pasta `Backend` com o seguinte conteúdo:

**Para MySQL local:**
```env
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/movup"
```

**Para Docker:**
```env
DATABASE_URL="mysql://root:senha123@localhost:3306/movup"
```

**Substitua:**
- `SUA_SENHA` ou `senha123`: pela senha que você configurou
- `localhost:3306`: ajuste se necessário
- `movup`: nome do banco de dados

### Passo 2: Criar o Banco de Dados

**Se você instalou MySQL diretamente:**

1. Abra o **MySQL Command Line Client** ou **MySQL Workbench**
2. Execute:
```sql
CREATE DATABASE movup;
```

**Se você usou Docker:**
O banco já foi criado automaticamente! Pule para o próximo passo.

### Passo 3: Instalar Dependências do Backend

```powershell
cd Backend
npm install
```

### Passo 4: Gerar Cliente Prisma

```powershell
npm run prisma:generate
```

Ou:
```powershell
npx prisma generate
```

### Passo 5: Executar Migrações

```powershell
npx prisma migrate dev --name init
```

Isso irá criar todas as tabelas no banco de dados.

### Passo 6: Verificar (Opcional)

Abra o Prisma Studio para visualizar o banco:

```powershell
npx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver e editar os dados.

## Comandos Úteis

### Parar Container Docker
```powershell
docker stop movup-mysql
```

### Iniciar Container Docker
```powershell
docker start movup-mysql
```

### Remover Container Docker (CUIDADO: apaga os dados)
```powershell
docker rm -f movup-mysql
```

### Resetar Banco de Dados (CUIDADO: apaga todos os dados)
```powershell
npx prisma migrate reset
```

## Troubleshooting

### Erro: "Can't connect to MySQL server"
- Verifique se o MySQL está rodando
- Verifique se a porta 3306 está correta
- Verifique se o firewall não está bloqueando

### Erro: "Access denied for user 'root'"
- Verifique a senha no arquivo `.env`
- Tente resetar a senha do MySQL

### Erro: "Database 'movup' does not exist"
- Crie o banco manualmente: `CREATE DATABASE movup;`

### Erro de conexão com Docker
- Verifique se o Docker está rodando: `docker ps`
- Verifique se a porta 3306 não está em uso por outro serviço

## Estrutura do Banco de Dados

O banco terá as seguintes tabelas:
- **User**: Usuários do sistema
- **FichaMedica**: Fichas médicas dos usuários
- **Analise**: Análises de vídeo dos usuários

## Próximos Passos

Após configurar o banco:
1. Inicie o servidor backend: `npm start`
2. O servidor estará disponível em `http://localhost:3000`

