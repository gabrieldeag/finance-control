# Sistema de Controle Financeiro

Bem-vindo ao Sistema de Controle Financeiro! Este é um aplicativo simples para gerenciar suas finanças pessoais, permitindo adicionar categorias, registrar transações e visualizar relatórios de entrada e saída de dinheiro.

## 🖥️ Demo
- [Demostração do Sistema](https://gabrieldeag.github.io/finance-control/public)

## 📋 Índice

- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Contribuição](#contribuição)
- [Licença](#licença)

## ✨ Funcionalidades

- Alternar entre temas claro e escuro
- Adicionar e remover categorias financeiras
- Registrar transações com descrição, valor, categoria, operação (entrada/saída) e data
- Filtrar transações por intervalo de datas
- Visualizar total de entradas, saídas e resumo financeiro

## 🚀 Instalação

### Pré-requisitos

- Node.js instalado
- NPM (Node Package Manager) instalado
- MongoDB instalado e em execução

### Passos

1. Clone o repositório:
    ```bash
    git clone https://github.com/gabrieldeag/finance-control.git
    ```
2. Navegue até o diretório do projeto:
    ```bash
    cd finance-control
    ```
3. Instale as dependências:
    ```bash
    npm install
    ```
4. Configure a conexão com o MongoDB:

    Crie um arquivo `.env` na raiz do projeto com a seguinte variável de ambiente:
    ```env
    MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
    ```
5. Inicie o servidor:
    ```bash
    npm start
    ```

## 📝 Como Usar

1. Utilize a interface para:
    - Adicionar categorias
    - Adicionar transações financeiras
    - Filtrar transações por data
    - Visualizar relatórios financeiros

## 💻 Tecnologias Utilizadas

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- HTML, CSS e JavaScript

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir uma issue ou enviar um pull request.

1. Faça um fork do projeto
2. Crie uma nova branch: `git checkout -b minha-nova-feature`
3. Faça suas alterações e comite: `git commit -m 'Minha nova feature'`
4. Envie para o repositório remoto: `git push origin minha-nova-feature`
5. Abra um pull request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Feito por [Gabriel Andrade](https://github.com/gabrieldeag)
