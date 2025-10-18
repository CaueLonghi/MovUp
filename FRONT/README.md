# MovUp - Plataforma de Análise de Movimento PWA

Uma aplicação web progressiva (PWA) moderna, mobile-first, construída com React, PrimeReact e React Router v6. MovUp é projetada para fornecer uma experiência perfeita de análise de movimento e corrida com capacidades offline.

## 🚀 Funcionalidades

- **Aplicação Web Progressiva (PWA)**: Aplicação web instalável e com capacidade offline
- **Design Mobile-First**: Design responsivo otimizado para dispositivos móveis
- **Sistema de Autenticação**: Registro, login e gerenciamento de perfil de usuário
- **Análise de Movimento**: Upload e análise de vídeos de corrida
- **Interface Moderna**: Construída com componentes PrimeReact e PrimeIcons
- **Navegação Responsiva**: Barra de navegação inferior para usuários móveis
- **Suporte Offline**: Service worker para cache e funcionalidade offline
- **Validação de Formulários**: Validação abrangente do lado do cliente com tratamento de erros
- **Carregamento Lazy**: Otimização de performance com divisão de código

## 🛠️ Stack Tecnológica

- **Framework Frontend**: React 18
- **Ferramenta de Build**: Vite
- **Componentes UI**: PrimeReact
- **Ícones**: PrimeIcons
- **Estilização**: PrimeFlex CSS Framework
- **Roteamento**: React Router v6
- **Gerenciamento de Estado**: React Context API + useState
- **Qualidade de Código**: ESLint + Prettier
- **PWA**: Service Worker + Web App Manifest

## 📱 Funcionalidades PWA

- **Instalável**: Adicionar à tela inicial em dispositivos móveis
- **Suporte Offline**: Cache básico para uso offline
- **Experiência App-like**: Modo tela cheia e sensação de app nativo
- **Design Responsivo**: Otimizado para todos os tamanhos de tela
- **Carregamento Rápido**: Performance otimizada com carregamento lazy

## 🎨 Sistema de Design

- **Cor Primária**: #FFEA00 (Amarelo)
- **Cor do Texto**: #000000 (Preto)
- **Fundo**: Tema amarelo com acentos brancos/amarelos claros
- **Tipografia**: Fontes do sistema para performance otimal
- **Ícones**: PrimeIcons com tamanho e espaçamento consistentes

## 📁 Estrutura do Projeto

```
src/
├── assets/          # Ativos estáticos (imagens, ícones)
├── components/      # Componentes UI reutilizáveis
├── contexts/        # Provedores React Context
├── hooks/           # Hooks React customizados
├── pages/           # Componentes de página
├── routes/          # Configuração de roteamento
├── services/        # Integrações de API e serviços externos
├── styles/          # Estilos globais e CSS
├── App.jsx          # Componente principal da aplicação
├── main.jsx         # Ponto de entrada da aplicação
└── index.css        # Variáveis CSS globais e estilos
```

## 🚀 Começando

### Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn gerenciador de pacotes

### Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositório>
   cd movup-frontend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   ```

4. **Abra seu navegador**
   Navegue para `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

Os arquivos construídos estarão no diretório `dist/`, prontos para deploy.

### Testando PWA

1. **Desenvolvimento**: Use Chrome DevTools > Aba Application para testar funcionalidades PWA
2. **Produção**: Deploy em hospedagem com HTTPS para funcionalidade PWA completa
3. **Instalação**: Use a opção "Adicionar à Tela Inicial" em navegadores móveis

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` no diretório raiz:

```env
VITE_API_URL=sua_endpoint_api_aqui
VITE_APP_NAME=MovUp
```

### Configuração PWA

- **Manifest**: Edite `public/manifest.json` para metadados do app
- **Service Worker**: Modifique `public/service-worker.js` para estratégias de cache
- **Ícones**: Substitua ícones placeholder no diretório `public/icons/`

### ESLint & Prettier

- **ESLint**: Configurado para melhores práticas React
- **Prettier**: Regras de formatação de código em `.prettierrc`

## 📱 Páginas e Funcionalidades

### Página Inicial
- Descrição do app e história do MovUp
- Galeria de funcionalidades com ícones placeholder
- Mensagem de boas-vindas para novos usuários

### Página de Vídeo
- Funcionalidade de upload de vídeo
- Validação de arquivo e prévia
- Progresso de upload e confirmação
- Tela de carregamento com spinner

### Página de Perfil
- Exibição de informações do usuário
- Histórico de pontuação e estatísticas
- Placeholders de funcionalidades para desenvolvimento futuro
- Funcionalidade de logout

### Autenticação
- **Login**: Email/senha com validação
- **Registro**: Nome completo, email, senha com confirmação
- Validação de formulário e tratamento de erros
- Design responsivo para dispositivos móveis

## 🎯 Melhorias Futuras

- **Integração Backend**: Conectar a endpoints de API reais
- **Processamento de Vídeo**: Implementar upload e processamento real de vídeo
- **Gerenciamento de Usuário**: Edição de perfil e configurações
- **Funcionalidades Sociais**: Comentários, curtidas e compartilhamento
- **Analytics**: Métricas de engajamento do usuário e performance de vídeo
- **Notificações Push**: Atualizações em tempo real e alertas
- **Cache Avançado**: Estratégias de cache inteligentes para melhor experiência offline

## 🧪 Testando

### Teste Manual
- Teste todas as páginas em diferentes tamanhos de tela
- Verifique instalação PWA em dispositivos móveis
- Teste funcionalidade offline
- Valide entradas de formulário e tratamento de erros

### Teste Automatizado
```bash
# Executar testes (quando implementado)
npm test

# Executar testes com cobertura
npm run test:coverage
```

## 📦 Deploy

### Hospedagem Estática
- **Netlify**: Arraste e solte a pasta `dist/`
- **Vercel**: Conecte repositório GitHub
- **Firebase Hosting**: Use Firebase CLI
- **GitHub Pages**: Deploy de GitHub Actions

### Requisitos PWA
- **HTTPS**: Obrigatório para service worker e funcionalidades PWA
- **Manifest Válido**: Certifique-se de que manifest.json está acessível
- **Service Worker**: Verifique registro do service worker

## 🤝 Contribuindo

1. Faça fork do repositório
2. Crie uma branch de funcionalidade (`git checkout -b feature/funcionalidade-incrivel`)
3. Commit suas mudanças (`git commit -m 'Adiciona funcionalidade incrível'`)
4. Push para a branch (`git push origin feature/funcionalidade-incrivel`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🙏 Agradecimentos

- **PrimeReact**: Pela excelente biblioteca de componentes UI
- **Equipe React**: Pelo framework incrível
- **Vite**: Pela ferramenta de build rápida
- **Comunidade PWA**: Pelas melhores práticas e diretrizes PWA

## 📞 Suporte

Para suporte e perguntas:
- Crie uma issue no repositório GitHub
- Entre em contato com a equipe de desenvolvimento
- Verifique a documentação e exemplos

---

**MovUp** - Capacitando corredores a analisar e melhorar sua técnica através de análise de movimento.
