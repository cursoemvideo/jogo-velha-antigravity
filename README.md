# Jogo da Velha — 2 Jogadores

Aplicação web de **Jogo da Velha** presencial para duas pessoas compartilhando o mesmo dispositivo, construída com HTML5 semântico, CSS3 moderno, JavaScript puro (ES Modules) e ilustrações SVG nativas, sem dependências externas.

## Funcionalidades

- **Identificação personalizada dos jogadores:** cada jogador escolhe um nome curto de **1 a 5 letras maiúsculas (`A`–`Z`)** com conversão automática e validação instantânea.
- **Catálogo de avatares exclusivos:** 8 mascotes ilustrados em SVG nativo (*Robô*, *Gato*, *Raposa*, *Astronauta*, *Dinossauro*, *Unicórnio*, *Alien* e *Polvo*), impedindo escolhas duplicadas entre a dupla.
- **Disputa no tabuleiro 3x3:** controle claro de turno exibindo nome, avatar e símbolo de cada participante (`X` para o Jogador 1 e `O` para o Jogador 2).
- **Detecção de resultado e celebração:** destaque visual das 3 casas da linha vencedora com animação comemorativa apresentando o nome e o avatar do vencedor, ou aviso de empate (**"Deu Velha!"**).
- **Revanche com alternância justa:** opção **Jogar Novamente** que mantém a dupla e alterna automaticamente quem faz a primeira jogada a cada nova partida, além da opção **Trocar Jogadores** ao final da disputa.
- **Acessibilidade e continuidade na sessão:** operação completa por clique, toque ou teclado (`Tab`, `Enter`, `Espaço` e setas direcionais no tabuleiro) e preservação temporária da partida no `sessionStorage` da aba contra recarregamentos acidentais.

## Estrutura do Projeto

```text
.
├── index.html              # Estrutura semântica principal da aplicação
├── css/
│   └── styles.css          # Estilos responsivos, variáveis visuais e animações CSS
├── js/
│   ├── main.js             # Inicialização, eventos de interface e sincronização com sessionStorage
│   ├── ui.js               # Renderização segura no DOM e efeitos de celebração
│   ├── game-engine.js      # Motor puro de regras, validações, turnos, vitória e revanche
│   └── avatars.js          # Catálogo estático dos 8 avatares em SVG nativo
└── tests/
    └── game-engine.test.js # Testes unitários automatizados com node:test
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
