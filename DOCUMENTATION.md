# Guia Definitivo e Detalhado de Migração: R Shiny para React (Mantine)

Este documento descreve detalhadamente a arquitetura do projeto "Garu Estatística", explicando como o projeto evoluiu de uma aplicação R Shiny (`Garu_ShinyR`) para uma aplicação web moderna utilizando React, TypeScript, Vite e Mantine (`garu-estatistica`). 

O objetivo é fornecer uma visão aprofundada de **tudo** no projeto: o que cada arquivo faz, como os conceitos do R foram traduzidos para o ecossistema JavaScript/TypeScript, o funcionamento interno, e como dar manutenção ou expandir as funcionalidades.

---

## 1. Visão Geral da Arquitetura

A principal mudança de paradigma é a passagem de um modelo **cliente-servidor** (onde o Shiny precisa rodar cálculos em um servidor R e enviar o HTML para o cliente) para uma **Single Page Application (SPA)** rodando 100% no navegador do usuário (Client-side).

### Tecnologias Utilizadas

| Funcionalidade | R Shiny (Antigo) | React / TypeScript (Novo) |
|---|---|---|
| **Linguagem Principal** | R | TypeScript (Superset do JavaScript com tipagem) |
| **Interface do Usuário (UI)** | `ui.R` (Widgets Shiny) | Componentes React + Mantine (`@mantine/core`) |
| **Lógica de Aplicação** | `server.R` + scripts extras (`inferencia.R`...) | Arquivos `.tsx` e funções puras em `src/utils/` |
| **Gerenciamento de Estado** | `reactive()`, `observe()`, `input$`, `output$` | Zustand (`src/stores/`) + React `useState` |
| **Navegação (Roteamento)** | Abas do Shinydashboard/Navbar | React Router DOM (`react-router-dom`) |
| **Gráficos** | `ggplot2`, Plotly | Recharts, Mantine Charts (`@mantine/charts`) |
| **Matemática e Fórmulas** | `plotmath`, HTML bruto | KaTeX (`react-katex`) para exibição de matemática |
| **Motor Estatístico** | Funções nativas do R (`pnorm`, `t.test`...) | Dependência `jstat` e funções manuais em `utils` |
| **Bancos de Dados/CSVs** | Leitura no servidor via `read.csv()` | PapaParse e carregamento client-side ou arquivos `.ts` hardcoded |

---

## 2. Estrutura de Pastas e Comparação

Vamos analisar o que cada arquivo no antigo projeto R faz e como ele se traduz para a estrutura do novo aplicativo React.

### 2.1 Projeto Antigo: `Garu_ShinyR/`
* `ui.R` e `server.R`: Arquivo de interface e lógica reativa principal do R.
* `global.R`: Carregava pacotes e dados antes de iniciar o app.
* Arquivos independentes de análise (ex: `distr_prob.R`, `inferencia.R`, `medidas_resumo.R`, `tabela_frequencias.R`, `tipos_variaveis.R`): Contêm a lógica modular das ferramentas estatísticas, geralmente implementando UIs e UIs reativas (outputs).
* `data/`: CSVs com os bancos de dados usados no projeto (ex: `dados_paralisia.csv`).

### 2.2 Projeto Novo: `garu-estatistica/`

O novo projeto utiliza a estruturação padrão recomendada pelo **Vite**, altamente organizada em features e páginas.

```text
garu-estatistica/
├── package.json             # Dependências globais do projeto (scripts de build, dev, pacotes como jstat, mantine).
├── tsconfig.*.json          # Configuração do compilador TypeScript para garantir tipagem em todo o código.
├── vite.config.ts           # Configuração do empacotador web (o equivalente JavaScript para gerar sua aplicação final).
├── public/                  
│   └── data/                # CSVs expostos diretamente ao navegador (os mesmos encontrados em Garu_ShinyR/data).
└── src/                     # O código-fonte da aplicação React
    ├── main.tsx             # Ponto de entrada (equivalente ao runApp). Onde a aplicação React agarra a div do index.html.
    ├── App.tsx              # Estrutura principal da interface de usuário, roteamento, provedores Mantine e layout base.
    ├── theme.ts             # Configuração central de identidade visual e tematização do Mantine UI.
    │
    ├── components/          # Elementos de UI reaproveitáveis (como pedaços independentes de UI)
    │   ├── Sidebar.tsx      # Menu lateral de navegação (Substitui navegações ou sidebars do Shiny).
    │   ├── CollapsibleSection.tsx # Sessões que se contraem/expandem, útil para páginas muito densas.
    │   └── FormulaBlock.tsx # Reutilizado na teoria para exibir fórmulas com KaTeX com clareza.
    │
    ├── pages/               # Cada arquivo representa uma 'Aba' antiga do Shiny (Página da SPA).
    │   ├── ConjuntoDados.tsx      # Tabela de dados (antes conjunto_dados.R).
    │   ├── Distribuicoes.tsx      # Funcionalidade do distr_prob.R (Binomial, Normal, Poisson).
    │   ├── MedidasResumo.tsx      # Cálculo de Média, Moda, Mediana (medidas_resumo.R).
    │   ├── TesteCorrelacao.tsx    # Funcionalidades importadas e divididas do inferencia.R
    │   ├── TesteQuiQuadrado.tsx   
    │   ├── TesteT.tsx             
    │   ├── GraficosBidimensionais.tsx # Transcritos e convertidos do graficos.R
    │   ├── GraficosQualitativos.tsx
    │   └── GraficosQuantitativos.tsx
    │
    ├── stores/              # Gerenciamento de Estado (Substitui inputs e reatividade do Shiny Server)
    │   ├── useDataStore.ts      # Salva na memória o dataset selecionado ou importado globalmente no app.
    │   └── useSummaryStore.ts   # Pode reter resumos estatísticos globais.
    │
    ├── data/                # Bases de dados pré-processadas e fixas em código TypeScript.
    │   ├── dadosParalisia.ts    # Versões importáveis de JSON do TS em vez de ler CSV em tempo de execução.
    │   └── dataDictionaries.ts  # Dicionários de metadados das variáveis.
    │
    └── utils/               # MOTOR ESTATÍSTICO DO PROJETO (onde as contas são feitas)
        ├── distributions.ts # Contas de função massa de probabilidade, FDA. Substitui as chamadas dnorm, pnorm do R.
        ├── statistics.ts    # Lógica de desvio padrão rudimentar, médias, dependente de pacotes como 'jstat'.
        └── formatting.ts    # Formatação de string/decimais.
```

---

## 3. A Mecânica da Aplicação: Como Funciona o React neste Projeto

Se no Shiny a regra era a de atualizar o `ui.R` renderizando com os dados processados no `server.R`, no **React** o ciclo ocorre inteiramente na frente (frontend):

### 3.1. Estado (Reactividade) e `Zustand`
No Shiny, usávamos variáveis reativas como `reactive({})` e `observe({})` que ficavam escutando o `input$nome`.
No React, usamos:
* **Estado Local (`useState`)**: Para guardar coisas específicas de uma única página (ex: a cor atual de um gráfico na página `GraficosQuantitativos.tsx`).
* **Estado Global (Zustand - `src/stores/`)**: O Zustand funciona como um local super global para variáveis (equivalente a ter uma variável reativa central que todas as páginas conseguem enxergar). `useDataStore.ts`, por exemplo, guarda a base de dados em memória; assim, quando o usuário muda da aba "Medidas Resumo" para "Gráficos Bidimensionais", os dados continuam lá sem zerar o app inteiro.

### 3.2. De Funções Nativas (R) para Bibliotecas JavaScript (`jstat`)
No R, fazer um teste t era simples como `t.test(x, y)`. JavaScript nativo não foi construído para estatística.
Para solucionar, o projeto React faz uso pesado da biblioteca `jstat` agrupada no diretório `utils/`:
* Arquivos como `src/utils/statistics.ts` encapsulam a lógica do `jstat` transformando-a em funções mais fáceis de chamar nas planilhas, para gerar valores de $p-valor$, Z-scores, distribuições chi-quadrado, etc.

### 3.3. Roteamento (Links entre páginas)
O sistema R Shiny cria as páginas programaticamente. O projeto React usa o `react-router-dom`. No arquivo `src/App.tsx`, há um sistema de rotas como `<Route path="/distribuicoes" element={<Distribuicoes />} />`. O `Sidebar.tsx` aciona os botões para trocar rapidamente de tela sem recarregar a página web (SPA feature).

### 3.4. Gráficos (Do `ggplot2` para `Recharts` e `Mantine Charts`)
* No R Shiny, você gerava uma imagem estática/png usando `renderPlot({ ggplot(...) ... })`.
* No React web, utilizamos as bibliotecas do pacote Recharts ou `@mantine/charts`. Estes geram SVGs interativos direto no código.
* Em arquivos como `GraficosQuantitativos.tsx`, a coleção de dados do `useDataStore` é formatada em em um array de objetos (JSON) que o `<BarChart...>` nativo compreende prontamente, definindo eixos `x` e `y` explicitamente na tag do componente.

---

## 4. O Fluxo de Execução - Passo a Passo

Para facilitar, analise o caminho que os dados percorrem quando o usuário abre o site e interage com ele:

1. **Inicialização (`index.html` → `main.tsx`)**: O site liga no arquivo principal `index.html` que pega tudo e injeta pelo `main.tsx` dentro da `<div id="root">`.
2. **Definição de Layout (`App.tsx`)**: Aplica-se o tema do **Mantine** (cores bases, fontes) listado no `theme.ts` e renderiza a casca da página (Header com Título + Sidebar Menu).
3. **Página Específica (ex: `MedidasResumo.tsx`)**: O roteador aciona a página no contexto central. Se for uma página de estatística descritiva:
   1. Ela chama o Hook `const data = useDataStore((state) => state.data)` resgatando o dataset ativo da memória.
   2. Exibe dropdowns do sistema Mantine `<Select />` perguntando quais colunas o usuário quer usar.
   3. Baseado no evento `onChange`, o React atualiza o próprio estado local.
   4. A mudança de estado dispara os scripts de `statistics.ts` calculando a Média, Moda, e Desvio.
   5. Os valores retornam e o pacote **DOM** do React se encarrega de exibir automaticamente na tela (`<Text>Media: {media}</Text>`).
   6. Se existe lógica de fórmula matemática, o pacote **KaTeX** converte string latex tipo `\sigma^2` em uma fórmula renderizada graficamente via `<FormulaBlock />`.

---

## 5. Como trabalhar no Novo Projeto (Para Manutenção)

Para modificar, criar ou testar funcionalidades nesta nova arquitetura, aqui está o guia diário para execução:

### Subindo o ambiente de teste
Abra o terminal, acesse a pasta do projeto `cd garu-estatistica` e utilize o script Vite:
```bash
npm run dev
# Isso abrirá algo em http://localhost:5173 
```

### Criando Nova Ferramenta Estatística (Uma 'Aba' nova)
1. **Página:** Crie um arquivo em `src/pages/SuaFerramenta.tsx`.
2. **Rota:** Importe e registre no arquivo `src/App.tsx` usando a tag `<Route />`.
3. **Menu:** Adicione um item no menu dentro de `src/components/Sidebar.tsx` (adicione link para `/sua-ferramenta`).
4. **Cálculos:** Idealmente, você nunca deve escrever toda a base matemática gigante *dentro* do componente (`.tsx`). Crie as funções necessárias no `src/utils/statistics.ts` usando a biblioteca jstat e importe os cálculos prontos na página.

### Ajustando o Tema Visual (Para parecer o antigo ou modernizar)
Todas as configurações escuras/claras, cores e características visuais gerais residem em dois locais:
1. `src/theme.ts`: Base de estilos e construtores de classe do Mantine.
2. `src/index.css` e `src/App.css`: Ajustes manuais customizados de flexbox de telas se necessário (embora recomende-se usar Props de Flex nativos do Mantine, ex: `<Group>`, `<Stack>`).

### Diferenças no Lidamento com Dados
Em Shiny, dados geralmente eram apenas Dataframes (`df`). O Typescript usa forte tipagem `type DatasetItem = Record<string, number | string>`. Portanto toda leitura de CSV com **PapaParse** ou acesso da base já gera Objetos em javascript:
`[{id: 1, idade: 35, grupo: "A"}, {id: 2, idade: 40, grupo: "B"}]`. Você usa funções de JS primitivas (como `.map()`, `.filter()`, `.reduce()`) rotineiramente, ao invés da sintaxe `dplyr` do R.
