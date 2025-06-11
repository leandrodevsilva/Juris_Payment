# Manual do Usuário - Juris Payment

Bem-vindo ao Juris Payment! Este manual irá guiá-lo através das funcionalidades do aplicativo para ajudá-lo a gerenciar os pagamentos de seus clientes de forma eficiente.

## Sumário

1.  [Iniciando o Aplicativo](#1-iniciando-o-aplicativo)
2.  [Visão Geral - Dashboard](#2-visão-geral---dashboard)
3.  [Gerenciamento de Clientes](#3-gerenciamento-de-clientes)
    *   [Listando Clientes](#listando-clientes)
    *   [Buscando Clientes](#buscando-clientes)
    *   [Filtrando Clientes com Débitos](#filtrando-clientes-com-débitos)
    *   [Cadastrando um Novo Cliente](#cadastrando-um-novo-cliente)
    *   [Visualizando Detalhes do Cliente](#visualizando-detalhes-do-cliente)
    *   [Editando um Cliente](#editando-um-cliente)
    *   [Excluindo um Cliente](#excluindo-um-cliente)
4.  [Gerenciamento de Pagamentos](#4-gerenciamento-de-pagamentos)
    *   [Adicionando um Pagamento](#adicionando-um-pagamento)
    *   [Editando um Pagamento](#editando-um-pagamento)
    *   [Excluindo um Pagamento](#excluindo-um-pagamento)
5.  [Backup e Restauração de Dados](#5-backup-e-restauração-de-dados)
    *   [Fazendo Backup](#fazendo-backup)
    *   [Importando (Restaurando) Dados](#importando-restaurando-dados)
6.  [Configurações Visuais e Personalização](#6-configurações-visuais-e-personalização)
    *   [Modo Claro e Escuro (Light/Dark Mode)](#modo-claro-e-escuro-lightdark-mode)
    *   [Fonte da Interface](#fonte-da-interface)
    *   [Logo Personalizável](#logo-personalizável)
7.  [Solução de Problemas (Básico)](#7-solução-de-problemas-básico)
8.  [Suporte Técnico e Contato](#8-suporte-técnico-e-contato)

---

## 1. Iniciando o Aplicativo

Após a instalação, você pode iniciar o Juris Payment através do atalho criado em sua área de trabalho ou menu Iniciar.

Ao abrir, você será apresentado ao **Dashboard**. O aplicativo também permite a personalização visual, como a escolha entre temas claro e escuro, e a adição de um logo personalizado (veja a seção "Configurações Visuais e Personalização").

## 2. Visão Geral - Dashboard

O Dashboard é a tela inicial e oferece um resumo rápido das informações importantes através de cards e gráficos:

**Cards de Resumo:**

*   **Total de Clientes:** Exibe o número total de clientes cadastrados no sistema. Clicar neste card direciona para a lista completa de clientes.
*   **Total Recebido (Mês):** Mostra a soma de todos os pagamentos recebidos de todos os clientes durante o mês corrente. Este valor é zerado no início de cada novo mês.
*   **Valor à Receber:** Apresenta o valor total que ainda falta ser pago por todos os clientes, considerando o valor total das ações menos o total já pago por eles ao longo do tempo.
*   **Backup / Restore:** Oferece um atalho rápido para a página de Backup e Restauração de dados. Clicar neste card direciona para a respectiva funcionalidade.

**Gráficos:**

*   **Receita Mensal:** Um gráfico de barras que exibe a receita (total de pagamentos recebidos) para cada mês do ano corrente.
*   **Histórico de Receita (Últimos 12 Meses):** Um gráfico de barras que mostra a receita dos últimos 12 meses, incluindo o mês atual, permitindo uma visão da tendência de recebimentos.

Utilize o menu lateral esquerdo para navegar entre as diferentes seções do aplicativo, como "Clientes" e "Backup / Restore".


## 3. Gerenciamento de Clientes

### Listando Clientes

Clique em **"Clientes"** no menu lateral para acessar a lista de todos os clientes cadastrados. A lista exibe:

*   Nome Completo
*   CPF/CNPJ
*   Valor Total (R$)
*   Valor Pago (R$)
*   Valor em Aberto (R$)
*   Ações (Visualizar, Editar, Excluir)

A lista é paginada para melhor visualização caso haja muitos clientes.

### Buscando Clientes

No topo da lista de clientes, há um campo de busca. Você pode digitar o nome, CPF/CNPJ ou número do processo para filtrar a lista e encontrar clientes específicos rapidamente.

### Filtrando Clientes com Débitos

Abaixo do campo de busca na tela "Lista de Clientes", você encontrará um interruptor (toggle switch) com a etiqueta "Mostrar apenas clientes com débitos".

*   **Funcionalidade:** Ao ativar este interruptor, a lista de clientes será filtrada para exibir apenas aqueles que possuem um "Valor em Aberto" maior que zero. Isso permite focar rapidamente nos clientes com pagamentos pendentes.
*   **Uso Combinado:** Este filtro funciona em conjunto com o campo de busca. Você pode, por exemplo, ativar o filtro de débitos e depois buscar por um nome específico dentro da lista de clientes devedores.
*   **Desativando o Filtro:** Para visualizar todos os clientes novamente (independentemente de terem débitos ou não), basta desativar o interruptor.

### Cadastrando um Novo Cliente

1.  No menu lateral, clique em **"Cadastrar Cliente"** ou, na tela de "Lista de Clientes", clique no botão **"+ Novo Cliente"**.
2.  Preencha o formulário com as informações do cliente:
    *   **Nome Completo (Obrigatório)**
    *   CPF/CNPJ
    *   Telefone
    *   Email
    *   Endereço Completo
3.  Clique em **"Salvar Cliente"**.
    *   O valor da parcela será calculado automaticamente se o "Valor Total da Ação" e o "Número de Parcelas" forem fornecidos.
    *   Uma mensagem de sucesso ou erro será exibida.

### Visualizando Detalhes do Cliente

Na lista de clientes, clique no ícone de **olho (Visualizar)** na linha do cliente desejado. Você será levado à tela de "Detalhes do Cliente", que exibe:

*   Todas as informações cadastrais do cliente e da ação.
*   Resumo financeiro (Total Pago, Valor Restante).
*   Histórico de pagamentos realizados por este cliente.

**Cadastrando Ação Judicial (Obrigatório)**
*   Número do Processo (Opcional)
*   Valor Total da Ação (Ex: 15000.00)

### Editando um Cliente

1.  Na lista de clientes, clique no ícone de **lápis (Editar)** na linha do cliente desejado.
    *   Alternativamente, na tela de "Detalhes do Cliente", clique no botão **"Editar Cliente"**.
2.  O formulário de cadastro será preenchido com os dados atuais do cliente.
3.  Modifique as informações conforme necessário.
4.  Clique em **"Salvar Alterações"**.

### Excluindo um Cliente

1.  Na lista de clientes, clique no ícone de **lixeira (Excluir)** na linha do cliente desejado.
2.  Uma caixa de diálogo de confirmação aparecerá.
3.  Clique em **"Excluir"** para confirmar.
    *   **Atenção:** Excluir um cliente também removerá permanentemente todo o seu histórico de pagamentos associado. Esta ação não pode ser desfeita.

## 4. Gerenciamento de Pagamentos

O gerenciamento de pagamentos é feito na tela de **"Ação Cadastrada"**.

### Adicionando um Pagamento

1.  Navegue até a tela de "Detalhes do Cliente" do cliente para o qual deseja adicionar um pagamento.
2.  Na seção "Histórico de Pagamentos", clique no botão **"+ Adicionar Pagamento"**.
3.  Preencha o formulário do pagamento:
    *   **Data do Pagamento (Obrigatório):** Selecione a data.
    *   **Valor Pago (Obrigatório):** Insira o valor pago (Ex: 500.50).
    *   **Observação (Opcional):** Adicione qualquer nota relevante sobre o pagamento.
4.  Clique em **"Adicionar Pagamento"** (ou "Salvar Alterações" se estiver editando).
    *   O pagamento será listado e o "Total Pago" e "Valor Restante" do cliente serão atualizados.

### Editando um Pagamento

1.  Na lista de pagamentos (dentro da tela "Detalhes do Cliente"), clique no ícone de **lápis (Editar)** na linha do pagamento desejado.
2.  O formulário de pagamento será preenchido com os dados atuais.
3.  Modifique as informações e clique em **"Salvar Alterações"**.

### Excluindo um Pagamento

1.  Na lista de pagamentos, clique no ícone de **lixeira (Excluir)** na linha do pagamento desejado.
2.  Confirme a exclusão na caixa de diálogo.
    *   O "Total Pago" e "Valor Restante" do cliente serão recalculados.

## 5. Backup e Restauração de Dados

É crucial fazer backups regulares dos seus dados para evitar perdas.

### Fazendo Backup

1.  No menu lateral, clique em **"Backup / Restore"**. Você será direcionado para a página de gerenciamento de backups.
2.  Na página de "Backup e Restauração de Dados", clique no botão **"Realizar Backup dos Dados"**.
3.  Uma caixa de diálogo para salvar o arquivo será aberta.
4.  Escolha o local e o nome para o arquivo de backup (o padrão é `juris_payment_backup_AAAA-MM-DD_HHMMSS.json`).
5.  Clique em **"Salvar"**.
    *   Uma mensagem confirmará o sucesso e o local do arquivo salvo.

### Importando (Restaurando) Dados

A importação de dados **substituirá todos os dados existentes** no aplicativo pelos dados do arquivo de backup. Certifique-se de que o arquivo selecionado é o correto e, se possível, faça um backup dos dados atuais antes de restaurar um antigo.

1.  No menu lateral, clique em **"Backup / Restore"**.
2.  Na página de "Backup e Restauração de Dados", clique no botão **"Restaurar Dados de um Backup"**.
3.  Uma caixa de diálogo para abrir arquivo será exibida.
4.  Selecione o arquivo de backup `.json` que deseja restaurar.
5.  Clique em **"Abrir"**.
    *   Os dados serão importados. Pode ser necessário navegar para a lista de clientes ou dashboard novamente para ver os dados atualizados.
    *   Uma mensagem confirmará o sucesso da importação.

## 6. Configurações Visuais e Personalização

O Juris Payment oferece opções para personalizar sua experiência visual e adequá-la às suas preferências.

### Modo Claro e Escuro (Light/Dark Mode)

Para melhor adaptação visual e conforto durante o uso, você pode alternar facilmente entre o modo Claro (Light) e Escuro (Dark).

*   **Como alternar:** Na barra superior do aplicativo, você encontrará um ícone para alternar o tema. Se estiver no modo claro, será um ícone de lua (ou similar para indicar o modo escuro). Se estiver no modo escuro, será um ícone de sol (ou similar para indicar o modo claro). Clique neste ícone para mudar o tema instantaneamente.

### Fonte da Interface

A interface do Juris Payment utiliza a fonte "Montserrat" como padrão. Esta escolha visa proporcionar uma experiência de usuário moderna, com boa legibilidade e um visual agradável. (O trabalho de harmonização visual da interface com esta fonte está em progresso).

## 7. Solução de Problemas (Básico)

*   **Aplicativo não inicia:** Verifique se o Node.js está instalado (para ambiente de desenvolvimento). Se for um aplicativo instalado, tente reinstalar.
*   **Erro ao salvar/carregar dados:** Verifique se há mensagens de erro específicas. O banco de dados é armazenado em: `C:\Users\SEU_USUARIO\AppData\Roaming\Juris Payment\juris_payment.db`. Certifique-se de que o aplicativo tem permissão para escrever neste local.
*   **Dados não atualizam após importação:** Tente navegar para outra tela e voltar, ou, em último caso, reiniciar o aplicativo.

## 8. Suporte Técnico e Contato

Se você encontrar problemas não listados acima, tiver dúvidas sobre o uso do Juris Payment, ou sugestões para futuras melhorias, não hesite em entrar em contato:

*   **E-mail:** [lasmg93@outlook.com](mailto:lasmg93@outlook.com)
*   **Telefone:** (35) 99262-3852
*   **GitHub (Desenvolvedor):** [Leandro Silva (@leandrodevsilva)](https://github.com/leandrodevsilva)

Para informações sobre a estrutura do projeto (relevante para desenvolvedores), consulte o arquivo `README.md` localizado na raiz do projeto.
