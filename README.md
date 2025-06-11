# Juris Payment

Juris Payment é um sistema de gerenciamento de pagamentos para desktop, projetado para simplificar o controle financeiro de clientes e processos, especialmente útil para profissionais autônomos e pequenos escritórios.

## Funcionalidades Principais

*   **Dashboard Interativo**: Visão geral das finanças com cards de resumo (Total de Clientes, Total Recebido no Mês, Valor a Receber) e gráficos de receita.
*   **Gerenciamento Completo de Clientes**:
    *   Cadastro, edição e exclusão de clientes.
    *   Busca e listagem paginada de clientes.
    *   Filtro para exibir apenas clientes com débitos pendentes.
    *   Visualização detalhada de informações do cliente e da ação judicial associada.
*   **Gerenciamento de Pagamentos**:
    *   Registro de pagamentos por cliente.
    *   Edição e exclusão de registros de pagamento.
    *   Cálculo automático de valor restante.
*   **Backup e Restauração de Dados**: Funcionalidade para exportar (backup) e importar (restaurar) os dados da aplicação, garantindo a segurança das informações.
*   **Temas Visuais**: Suporte a modo Claro (Light) e Escuro (Dark) para melhor conforto visual e adaptação às preferências do usuário.
*   **Logo Personalizável**: Permite ao usuário adicionar um logo personalizado que é exibido na barra lateral da aplicação.
*   **Interface Moderna**: Construído com React e Material-UI, utilizando a fonte Montserrat para uma experiência de usuário agradável.

## Tecnologia Utilizada

*   **Electron**: Para criação da aplicação desktop multiplataforma.
*   **React**: Biblioteca JavaScript para construção da interface de usuário.
*   **Material-UI (MUI)**: Framework de componentes React para um design moderno e responsivo.
*   **Node.js**: Ambiente de execução JavaScript.
*   **SQLite**: Banco de dados relacional leve para armazenamento local dos dados.

## Pré-requisitos

*   [Node.js](https://nodejs.org/) (que inclui npm) instalado em seu sistema.

## Instalação e Configuração

1.  **Clone o repositório** (se aplicável, substitua pela URL correta):
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO_GIT_AQUI>
    cd JurisPayment
    ```
    Se você já possui os arquivos do projeto, pule esta etapa e navegue até o diretório `JurisPayment`.

2.  **Instale as dependências** do projeto:
    ```bash
    npm install
    ```
    (Ou `yarn install` se você utilizar o Yarn)

## Executando a Aplicação (Modo de Desenvolvimento)

Para iniciar a aplicação em modo de desenvolvimento, execute o seguinte comando no terminal, a partir da raiz do projeto `JurisPayment`:

```bash
npm run build-renderer
```
e após

```bash
npm run dev
```
Isso geralmente iniciará a aplicação com hot-reloading e ferramentas de desenvolvimento ativadas.

## Compilando a Aplicação (Build para Produção)

Para criar uma versão empacotada da aplicação para distribuição, utilize:

```bash
npm run build-renderer
```
e após

```bash
npm run build
```

## Estrutura do Projeto (Visão Geral)

*   `JurisPayment/`
    *   `docs/`: Contém a documentação do projeto, como o Manual do Usuário (`MANUAL.md`).
    *   `src/`: Código fonte da aplicação.
        *   `main/`: Arquivos relacionados ao processo principal do Electron (ex: `main.js`, `preload.js`).
        *   `renderer/`: Código fonte da interface do usuário construída com React.
            *   `assets/`: Arquivos estáticos como imagens (incluindo `logo.png`).
            *   `components/`: Componentes React reutilizáveis.
            *   `context/`: Context API do React (ex: para gerenciamento de tema).
            *   `pages/`: Componentes React que representam as diferentes telas/páginas da aplicação.
            *   `styles/`: Arquivos de estilização (ex: `themes.js`, `global.css`).
            *   `App.js`: Componente raiz da aplicação React.
            *   `index.js`: Ponto de entrada para o processo de renderização do React.
    *   `package.json`: Define os metadados do projeto, dependências e scripts.
    *   `README.md`: Este arquivo - informações gerais sobre o projeto.

## Banco de Dados

Os dados da aplicação (clientes, pagamentos, etc.) são armazenados localmente em um arquivo de banco de dados SQLite, localizado em:
`C:\Users\<SEU_NOME_DE_USUARIO>\AppData\Roaming\Juris Payment\juris_payment.db`

## Suporte e Contato

Para dúvidas, sugestões ou suporte técnico:

*   **E-mail**: [lasmg93@outlook.com](mailto:lasmg93@outlook.com)
*   **Telefone**: (35) 99262-3852
*   **GitHub (Desenvolvedor)**: [Leandro Silva (@leandrodevsilva)](https://github.com/leandrodevsilva)

*Este README fornece uma visão geral do projeto Juris Payment. Para um guia detalhado sobre as funcionalidades, consulte o [Manual do Usuário](MANUAL.md).*
