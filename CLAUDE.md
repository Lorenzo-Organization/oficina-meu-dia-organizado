# Regras da casa

## O que é e para quem

Painel do meu dia, da Stefani Transporte e Logística, transportadora de combustível.
É uma tela no navegador que mostra os compromissos de hoje com horário e as tarefas do dia.
É para quem coordena a operação e divide a agenda com o sócio. Pessoas de operação, não de tecnologia.

## Como rodar

Abrir `index.html` no navegador com dois cliques.
Se o navegador bloquear a leitura da planilha, rodar `npx serve .` nesta pasta e abrir o endereço que aparecer.
Não tem instalação, não tem banco de dados, não tem biblioteca externa.

## Onde ficam as coisas

- `index.html`: a tela.
- `estilo.css`: cores e tamanho de letra.
- `app.js`: toda a lógica, em JavaScript simples, comentado em português.
- `dados/exemplo.csv`: planilha de exemplo, dados inventados. A de verdade entra na mesma pasta.
- `TAREFAS.md`: o que fazer na sessão. `DIARIO.md`: o que foi feito, decidido e onde parou.

## O que nunca mexer

- Tarefa que não foi feita ontem aparece hoje. Nunca apagar nem esconder tarefa pendente.
- O aviso vermelho é 30 minutos antes do compromisso. Não mudar sem o grupo decidir.
- Compromisso do sócio sempre aparece na tela com a etiqueta de quem é. A pessoa precisa ver o horário dele para não marcar em cima.
- A pessoa digita do jeito que fala. Não exigir formato, formulário longo ou cadastro.
- Só a empresa sabe: os horários fixos da semana, quando o sócio não pode ser interrompido e o que conta como prioridade. O grupo deve preencher isso aqui antes de pedir mudanças que dependam disso.

## Como a gente fala

- Laranja da marca: `#FF8A1F`. Vermelho só para aviso de compromisso chegando.
- Tudo em português: textos da tela, comentários no código, nomes de variáveis e mensagens.
- Falamos "entrega", nunca "pedido".
- Tela legível de longe: letras grandes, poucas coisas por vez, o essencial cabe em 1280 por 720 sem rolar.
- Frases curtas, sem jargão. Se uma pessoa da operação não entende, reescreve.
