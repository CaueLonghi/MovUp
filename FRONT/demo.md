# Guia de Demo MovUp PWA

## 🚀 Início Rápido

1. **Instalar Dependências**
   ```bash
   npm install
   ```

2. **Iniciar Servidor de Desenvolvimento**
   ```bash
   npm run dev
   ```

3. **Abrir Navegador**
   Navegue para `http://localhost:5173`

## 📱 Testando a PWA

### 1. Fluxo de Autenticação
- O app inicia com uma tela de login
- Use qualquer combinação de email/senha (modo demo)
- Clique em "Cadastre-se aqui" para testar o registro
- Preencha o formulário de registro e envie

### 2. Funcionalidades Principais do App
- **Página Inicial**: Visualize descrição do app e galeria de funcionalidades
- **Página de Vídeo**: Teste funcionalidade de upload e análise de vídeo
- **Página de Perfil**: Visualize perfil do usuário e histórico de pontuação

### 3. Funcionalidades PWA
- **Instalar**: Use "Adicionar à Tela Inicial" em navegadores móveis
- **Offline**: Teste funcionalidade offline (cache básico)
- **Responsivo**: Redimensione o navegador para testar design mobile-first

## 🎯 Credenciais de Demo

Como este é um app demo, você pode usar qualquer credencial:
- **Email**: `demo@example.com`
- **Senha**: `password123`

## 🔧 Scripts Disponíveis

- `npm run dev` - Iniciar servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run lint` - Verificar qualidade do código
- `npm run format` - Formatar código com Prettier

## 📱 Teste Mobile

1. **Chrome DevTools**
   - Abra DevTools (F12)
   - Clique em "Toggle device toolbar"
   - Selecione dispositivo mobile
   - Teste design responsivo

2. **Teste PWA**
   - Use Chrome DevTools > Aba Application
   - Verifique Manifest e Service Worker
   - Teste funcionalidade offline

## 🎨 Funcionalidades de Design

- **Esquema de Cores**: Fundo amarelo (#FFEA00) com texto preto
- **Mobile-First**: Design responsivo otimizado para mobile
- **Componentes PrimeReact**: Componentes UI modernos e acessíveis
- **Navegação Inferior**: Barra de navegação fixa para usuários mobile

## 🚀 Próximos Passos

1. **Substituir Imagens Placeholder**
   - Adicione ícones reais em `public/icons/`
   - Adicione placeholder de vídeo em `public/placeholder-video.jpg`
   - Adicione avatar em `public/avatars/default.png`

2. **Conectar ao Backend**
   - Atualize endpoints de API nos serviços
   - Implemente autenticação real
   - Adicione processamento de vídeo

3. **Deploy**
   - Build com `npm run build`
   - Deploy da pasta `dist/` para serviço de hospedagem
   - Certifique-se de HTTPS para funcionalidades PWA

## 🐛 Solução de Problemas

- **Erros de Build**: Verifique console para dependências faltando
- **PWA Não Funcionando**: Certifique-se de HTTPS em produção
- **Problemas de Estilo**: Verifique imports CSS do PrimeReact
- **Problemas de Roteamento**: Verifique configuração do React Router

---

**Aproveite explorando o MovUp!** 🏃‍♀️✨
