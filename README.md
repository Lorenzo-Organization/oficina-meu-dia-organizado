# Meu dia organizado

Este é o projeto do grupo **"Meu dia organizado"** da oficina de IA na Stefani Transporte e Logística.

Ele é para quem coordena a operação e divide a agenda com o sócio.
Dá para abrir esta pasta no Claude Code e pedir as coisas em português, do seu jeito.

## O problema em uma frase

Chego de manhã e não sei por onde começar, e ainda esqueço horário de compromisso e atrapalho meu sócio.

## Como as pessoas escreveram

- "organizar as minhas tarefas do dia de maneira clara"
- "me organizar nos horários para os meus compromissos, acabo atrapalhando meu sócio"

## Diagnóstico

As tarefas do dia e os compromissos vivem na cabeça, no WhatsApp e em papel solto.
Sem um lugar só, o que é urgente se mistura com o que pode esperar.
O horário do compromisso só aparece quando já passou.
O custo é retrabalho, atraso e o sócio ficando na mão.

Isso acontece 7 vezes por semana e mexe com 3 pessoas.

## A solução: Painel do meu dia

### O que faz

É uma tela que abre no navegador.
De cima para baixo, ela mostra os compromissos de hoje com horário e a lista de tarefas do dia.
As tarefas ficam separadas em **"faço hoje"** e **"pode esperar"**.

Tem um campo onde a pessoa digita a tarefa ou o compromisso do jeito que fala.
Por exemplo: "ligar pro posto às 14h".
A tela encaixa no lugar certo sozinha.

Tem um botão **"feito"** em cada item.
E tem um aviso em vermelho quando um compromisso começa em menos de 30 minutos.

### O fluxo, passo a passo

1. A pessoa digita a tarefa ou o compromisso.
2. A tela guarda numa planilha simples.
3. De manhã, a tela lê a planilha.
4. Separa por hoje, horário e prioridade.
5. Mostra a lista e o alerta do próximo compromisso.
6. Um texto de agenda vai para o sócio.

### O que a tela faz sozinha

- Montar a lista do dia, sem precisar lembrar de cabeça.
- Lembrar de cada horário de compromisso.
- Preparar a agenda para mandar ao sócio por mensagem.
- Trazer para hoje o que ficou de ontem sem fazer, sem reescrever.

### O que continua na mão da pessoa

- Digitar cada tarefa e compromisso.
- Decidir o que é prioridade.
- Marcar como feito quando termina.

### O ganho

Sete vezes por semana, 3 pessoas deixam de parar para perguntar "o que eu faço agora" ou "que horas era mesmo".

### Como fica amanhã

Abre a tela às 7h.
Olha os três compromissos do dia e a lista do que fazer.
Começa pelo primeiro item sem pensar.

## Outras propostas

| Proposta | O que é | Esforço | Impacto |
|---|---|---|---|
| Painel do meu dia | Tela no navegador com compromissos e tarefas de hoje em ordem. O que não foi feito ontem aparece hoje. | 1 (baixo) | 4 (alto) |
| Agenda compartilhada com o sócio | Uma tela com a semana dos dois lado a lado. Fica vermelho quando dois horários batem. | 2 | 3 |
| Resumo do dia no fim da tarde | Um texto curto com o que foi feito, o que ficou e a agenda de amanhã. | 2 | 3 |

O primeiro passo de cada uma está na seção "Como pedir para a IA", no fim deste arquivo.

## Entrega mínima de hoje

Uma página que abre no navegador, lê uma planilha de tarefas e compromissos, e mostra só o de hoje.
Compromissos em ordem de horário no topo e tarefas embaixo, com botão de marcar feito.

**Já existe um protótipo pronto nesta pasta.** Ele funciona com os dados de exemplo.
O trabalho do grupo é abrir, testar, trocar pelos dados de verdade e melhorar.

## Como rodar

1. Abra a pasta no Finder ou no Explorador de Arquivos.
2. Dê dois cliques no arquivo `index.html`. Ele abre no navegador.

Se a tela mostrar um aviso vermelho dizendo que não conseguiu ler a planilha, o navegador bloqueou a leitura do arquivo.
Nesse caso, abra o terminal nesta pasta e rode:

```
npx serve .
```

Depois entre no endereço que aparecer, normalmente:

```
http://localhost:3000
```

## Os arquivos desta pasta

| Arquivo | O que é |
|---|---|
| `index.html` | A tela. É o que abre no navegador. |
| `estilo.css` | As cores e o tamanho das letras. |
| `app.js` | O que faz a tela funcionar. Está comentado em português. |
| `dados/exemplo.csv` | A planilha de exemplo. |
| `CLAUDE.md` | As regras da casa para a IA. Cabe numa tela. |
| `TAREFAS.md` | A lista do que fazer nos 70 minutos. |
| `DIARIO.md` | O diário de bordo. Anote no fim de cada sessão. |

## Os dados

**Atenção: os dados em `dados/exemplo.csv` são inventados.**
Os nomes, cidades, placas e horários servem só para a tela ter o que mostrar.
O grupo deve trocar pela planilha de verdade.

A planilha tem estas colunas:

| Coluna | O que colocar | Exemplo |
|---|---|---|
| tipo | `compromisso` ou `tarefa` | compromisso |
| descrição | O que é, escrito do seu jeito | Vistoria do caminhão BRA2E19 |
| data | Dia, no formato dia/mês/ano | 04/09/2026 |
| hora | Só para compromisso, no formato hora:minuto | 14:00 |
| prioridade | Só para tarefa: `faço hoje` ou `pode esperar` | faço hoje |
| quem | `Eu`, `Sócio` ou `Ambos` | Sócio |
| feito | `sim` ou `não` | não |

Para usar a planilha de verdade:

1. Salve a planilha como CSV com o mesmo cabeçalho. Pode ser vírgula ou ponto e vírgula.
2. Coloque o arquivo na pasta `dados`.
3. Troque o nome do arquivo na primeira linha de `app.js` ou peça para a IA fazer isso.

O que a pessoa digita na tela e o que ela marca como feito fica guardado no navegador.
Não volta para a planilha ainda. Isso é um bom próximo passo para pedir à IA.

## Como pedir para a IA

Copie e cole no Claude Code. Fale como você fala. Um pedido por vez.

**Pedido 1, para começar o painel com a planilha de verdade:**

```
Coloquei minha planilha de verdade em dados/minha-agenda.csv. Ela tem as colunas
tarefa, data, hora e prioridade. Faz a tela ler essa planilha em vez do exemplo
e mostrar só o dia de hoje: compromissos em ordem de horário em cima e tarefas
embaixo, em duas listas, "faço hoje" e "pode esperar", com botão de feito.
Não muda as cores nem o tamanho das letras.
```

**Pedido 2, para a agenda compartilhada com o sócio:**

```
Quero uma tela nova, chamada agenda-socio.html, que leia a mesma planilha e
mostre a semana inteira com meus compromissos de um lado e os do meu sócio do
outro, lado a lado, dia por dia. Quando um horário meu bater com um horário
dele, pinta de vermelho. Usa a coluna "quem" para saber de quem é cada um.
```

**Pedido 3, para o resumo do fim do dia:**

```
Quero um botão "fechar o dia" no painel. Quando eu clicar, ele monta um texto
curto com três partes: o que foi feito hoje, o que ficou pendente e os
compromissos de amanhã com horário. O texto tem que ficar pronto para eu copiar
e colar no WhatsApp. Escreve em português simples, sem enfeite.
```
