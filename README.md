Tchesco Barbershop
Uma aplicação web completa para gestão de barbearias, permitindo o agendamento de serviços, venda de produtos e gerenciamento de usuários.

Funcionalidades
Autenticação de Usuários: Cadastro e login com segurança (JWT e bcrypt).
Agendamento de Serviços: Marcação de horários para cortes de cabelo, barba e outros serviços.
Loja Virtual: Catálogo de produtos de barbearia disponíveis para compra.
Painel de Controle (Dashboard): Visão geral dos agendamentos e informações do usuário.
Design Responsivo e Moderno: Interface de usuário construída com React.
Tecnologias Utilizadas
Frontend
React.js
Vite
React Router DOM
Vitest & React Testing Library (Testes)
Backend
Node.js
Express.js
JSON Web Token (JWT)
Bcrypt.js
Banco de Dados suportado (MySQL / SQLite em memória)
Como Executar o Projeto Localmente
Pré-requisitos
Certifique-se de ter o Node.js e o npm instalados em sua máquina.

1. Clonar o repositório
git clone https://github.com/seu-usuario/barbearia.git
cd barbearia
2. Configurar e Executar o Backend
Abra um terminal e acesse a pasta do backend:

cd backend
npm install
Crie um arquivo .env na raiz da pasta backend com as variáveis de ambiente necessárias (ex: PORT, JWT_SECRET, configurações do BD). Depois inicie o servidor:

npm run dev
O servidor backend iniciará na porta 5000 (http://localhost:5000).

3. Configurar e Executar o Frontend
Em um novo terminal, acesse a pasta do frontend:

cd frontend
npm install
npm run dev
A aplicação frontend ficará disponível no seu navegador (geralmente em http://localhost:5173).

Testes
O projeto possui testes automatizados configurados para o frontend garantindo a qualidade das páginas e fluxos. Para executá-los:

cd frontend
npm run test
Licença
Este projeto está sob a licença ISC.

Professor
Hudson Neves# BaberShop
