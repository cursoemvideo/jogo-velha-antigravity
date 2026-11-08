# Jogo da Velha — Contra o Computador ou 2 Jogadores

Aplicação web de **Jogo da Velha** para jogar individualmente contra o computador (**CPU**) ou presencialmente em duas pessoas no mesmo dispositivo, construída com HTML5 semântico, CSS3 moderno, JavaScript puro (ES Modules) e ilustrações SVG nativas, sem dependências externas.

## Funcionalidades

- **Dois modos de jogo:** escolha entre **Contra o Computador** (pré-selecionado por padrão) e **2 Jogadores** no mesmo dispositivo.
- **Níveis de dificuldade da CPU:** enfrente o computador no nível **Fácil** (jogadas casuais aleatórias) ou **Difícil** (estratégia tática que busca vencer, bloqueia ameaças e prioriza posições-chave), com resposta automática após breve pausa visual.
- **Identificação personalizada dos jogadores:** cada jogador humano escolhe um nome curto de **1 a 5 letras maiúsculas (`A`–`Z`)** com conversão automática e validação instantânea.
- **Catálogo de avatares exclusivos:** 8 mascotes ilustrados em SVG nativo (*Robô*, *Gato*, *Raposa*, *Astronauta*, *Dinossauro*, *Unicórnio*, *Alien* e *Polvo*), impedindo escolhas duplicadas e atribuindo automaticamente um avatar distinto à `CPU`.
- **Disputa no tabuleiro 3x3:** controle claro de turno exibindo nome, avatar e símbolo de cada participante (`X` para o Jogador 1 e `O` para o Jogador 2 / `CPU`).
- **Detecção de resultado e celebração:** destaque visual das 3 casas da linha vencedora com animação comemorativa apresentando o nome e o avatar do vencedor, ou aviso de empate (**"Deu Velha!"**).
- **Revanche com alternância justa:** opção **Jogar Novamente** que mantém o modo, a dificuldade e os participantes, alternando automaticamente quem faz a primeira jogada a cada nova partida (inclusive com a `CPU` abrindo a partida quando for a vez dela), além da opção **Trocar Jogadores** ao final da disputa.
- **Acessibilidade e continuidade na sessão:** operação completa por clique, toque ou teclado (`Tab`, `Enter`, `Espaço` e setas direcionais no tabuleiro) e preservação temporária da partida no `sessionStorage` da aba contra recarregamentos acidentais.

## Estrutura do Projeto

```text
.
├── index.html              # Estrutura semântica principal da aplicação
├── css/
│   └── styles.css          # Estilos responsivos, variáveis visuais e animações CSS
├── js/
│   ├── main.js             # Inicialização, eventos de interface, temporizador da CPU e sessionStorage
│   ├── ui.js               # Renderização segura no DOM e efeitos de celebração
│   ├── game-engine.js      # Motor puro de regras, modos, validações, turnos, vitória e revanche
│   ├── cpu-ai.js           # Estratégia pura de decisão de jogada da CPU (Fácil e Difícil)
│   └── avatars.js          # Catálogo estático dos 8 avatares em SVG nativo
└── tests/
    ├── game-engine.test.js # Testes unitários automatizados do motor com node:test
    └── cpu-ai.test.js      # Testes unitários automatizados da estratégia da CPU com node:test
```

## Como Executar Localmente

Como a aplicação utiliza módulos nativos do JavaScript (`<script type="module">`), sirva a pasta por meio de um servidor HTTP estático local:

```bash
python3 -m http.server 8080
```

Em seguida, abra no navegador:

```text
http://localhost:8080
```

## Como Executar os Testes

Os testes unitários utilizam o executor nativo do Node.js (Node 18+ / 20+), sem necessidade de instalar pacotes externos:

```bash
node --test tests/*.test.js
```

## Publicação no GitHub Pages

Todos os caminhos de estilos e scripts utilizam referências relativas (`./`), permitindo publicação direta no **GitHub Pages** sem etapa de compilação:

1. No repositório do GitHub, acesse **Settings → Pages**.
2. Em **Build and deployment**, selecione **Deploy from a branch**.
3. Escolha a branch `main` e a pasta `/ (root)` e clique em **Save**.
