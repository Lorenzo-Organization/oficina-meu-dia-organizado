// ============================================================
// Painel do meu dia - Stefani Transporte e Logística
// JavaScript simples, sem biblioteca. Comentários em português.
//
// O que este arquivo faz, em ordem:
//   1. Lê a planilha dados/exemplo.csv
//   2. Junta com o que a pessoa digitou na tela (fica guardado no navegador)
//   3. Separa o que é do dia: compromissos por horário e tarefas por prioridade
//   4. Mostra tudo na tela e avisa em vermelho o compromisso que está chegando
// ============================================================

// Onde está a planilha. Quando tiver a planilha de verdade, troque o nome aqui.
var ARQUIVO_PLANILHA = 'dados/exemplo.csv';

// Nomes das "gavetas" do navegador (localStorage) onde guardamos
// o que foi digitado na tela e o que foi marcado como feito.
var GAVETA_NOVOS = 'painel-meu-dia-novos';
var GAVETA_FEITOS = 'painel-meu-dia-feitos';

// Quantos minutos antes do compromisso o aviso fica vermelho.
var MINUTOS_AVISO = 30;

// Estado da tela
var itens = [];          // todos os itens: os da planilha + os digitados
var feitos = {};         // { id: true ou false } - o que a pessoa marcou nesta tela
var diaEscolhido = '';   // dia mostrado, no formato aaaa-mm-dd
var textoBusca = '';     // o que está no campo "procurar"

// ------------------------------------------------------------
// Datas e horas
// ------------------------------------------------------------

function doisDigitos(n) {
  return n < 10 ? '0' + n : '' + n;
}

// Hoje no formato aaaa-mm-dd (é o formato que o campo de data do navegador usa)
function dataHojeISO() {
  var d = new Date();
  return d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate());
}

// "04/09/2026" vira "2026-09-04". Se já estiver nesse formato, devolve igual.
function brParaISO(texto) {
  texto = (texto || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) return texto;
  var partes = texto.split('/');
  if (partes.length !== 3) return '';
  var dia = parseInt(partes[0], 10);
  var mes = parseInt(partes[1], 10);
  var ano = partes[2].trim();
  if (ano.length === 2) ano = '20' + ano;
  if (isNaN(dia) || isNaN(mes)) return '';
  return ano + '-' + doisDigitos(mes) + '-' + doisDigitos(dia);
}

// "2026-09-04" vira "04/09/2026"
function isoParaBR(iso) {
  var p = iso.split('-');
  return p[2] + '/' + p[1] + '/' + p[0];
}

// "2026-09-04" vira "04/09"
function isoParaCurta(iso) {
  var p = iso.split('-');
  return p[2] + '/' + p[1];
}

// Soma dias a uma data aaaa-mm-dd
function somarDias(iso, quantos) {
  var p = iso.split('-');
  var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  d.setDate(d.getDate() + quantos);
  return d.getFullYear() + '-' + doisDigitos(d.getMonth() + 1) + '-' + doisDigitos(d.getDate());
}

// Aceita "14:00", "14h", "14h30", "8:05" e devolve sempre "14:00". Vazio se não for hora.
function normalizarHora(texto) {
  texto = (texto || '').trim().toLowerCase();
  if (!texto) return '';
  var m = texto.match(/^(\d{1,2})(?:[:h](\d{1,2})?)?$/);
  if (!m) return '';
  var h = parseInt(m[1], 10);
  var min = m[2] ? parseInt(m[2], 10) : 0;
  if (h > 23 || min > 59) return '';
  return doisDigitos(h) + ':' + doisDigitos(min);
}

// "14:30" vira 870 (minutos desde a meia-noite)
function horaEmMinutos(hora) {
  var p = hora.split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function agoraEmMinutos() {
  var d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function horaAgoraTexto() {
  var d = new Date();
  return doisDigitos(d.getHours()) + ':' + doisDigitos(d.getMinutes());
}

// "45 min" ou "2h10"
function tempoBonito(minutos) {
  if (minutos < 60) return minutos + ' min';
  var h = Math.floor(minutos / 60);
  var m = minutos % 60;
  return h + 'h' + (m ? doisDigitos(m) : '');
}

// Tira acentos, para comparar texto sem se preocupar com "ç" e "ã"
function semAcento(texto) {
  // Depois de separar as letras dos acentos, apaga os acentos (códigos 0300 a 036F)
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Troca < > & por códigos, para o texto digitado não virar código na tela
function escapar(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ------------------------------------------------------------
// Leitura da planilha (arquivo CSV)
// ------------------------------------------------------------

// O Excel em português costuma salvar com ponto e vírgula.
// Aqui a gente descobre qual separador a planilha usa.
function descobrirSeparador(primeiraLinha) {
  var virgulas = (primeiraLinha.match(/,/g) || []).length;
  var pontoVirgulas = (primeiraLinha.match(/;/g) || []).length;
  return pontoVirgulas > virgulas ? ';' : ',';
}

// Separa uma linha em colunas, respeitando aspas
function separarLinha(linha, separador) {
  var colunas = [];
  var atual = '';
  var dentroDeAspas = false;
  for (var i = 0; i < linha.length; i++) {
    var c = linha.charAt(i);
    if (c === '"') {
      dentroDeAspas = !dentroDeAspas;
    } else if (c === separador && !dentroDeAspas) {
      colunas.push(atual);
      atual = '';
    } else {
      atual += c;
    }
  }
  colunas.push(atual);
  return colunas;
}

// Transforma o texto do CSV numa lista de linhas.
// Cada linha vira um objeto com os nomes do cabeçalho (minúsculos, sem acento).
function lerCSV(texto) {
  texto = texto.replace(/^﻿/, ''); // tira uma marca invisível que o Excel às vezes põe
  var linhas = texto.split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
  if (linhas.length === 0) return [];
  var separador = descobrirSeparador(linhas[0]);
  var cabecalho = separarLinha(linhas[0], separador).map(function (c) {
    return semAcento(c.trim().toLowerCase());
  });
  var lista = [];
  for (var i = 1; i < linhas.length; i++) {
    var colunas = separarLinha(linhas[i], separador);
    var linha = {};
    for (var j = 0; j < cabecalho.length; j++) {
      linha[cabecalho[j]] = (colunas[j] || '').trim();
    }
    lista.push(linha);
  }
  return lista;
}

// "pode esperar", "baixa" e "depois" viram 'esperar'. O resto vira 'hoje'.
function normalizarPrioridade(texto) {
  texto = semAcento((texto || '').toLowerCase());
  if (texto.indexOf('esper') >= 0 || texto.indexOf('baixa') >= 0 || texto.indexOf('depois') >= 0) {
    return 'esperar';
  }
  return 'hoje';
}

// Transforma uma linha da planilha num item que a tela entende
function linhaParaItem(linha) {
  var hora = normalizarHora(linha.hora);
  var tipoTexto = semAcento((linha.tipo || '').toLowerCase());
  var tipo;
  if (tipoTexto.indexOf('compromisso') === 0) {
    tipo = 'compromisso';
  } else if (tipoTexto.indexOf('tarefa') === 0) {
    tipo = 'tarefa';
  } else {
    // Se a planilha não disser o tipo: quem tem hora é compromisso, o resto é tarefa
    tipo = hora ? 'compromisso' : 'tarefa';
  }
  var descricao = linha.descricao || linha.tarefa || linha.compromisso || linha.titulo || '';
  var data = brParaISO(linha.data);
  return {
    // O id é feito com a descrição e a data, para o "feito" continuar valendo
    // mesmo se a ordem das linhas mudar na planilha.
    id: 'planilha-' + semAcento((descricao + '-' + data).toLowerCase()).replace(/[^a-z0-9]+/g, '-'),
    tipo: tipo,
    descricao: descricao,
    data: data,
    hora: hora,
    prioridade: normalizarPrioridade(linha.prioridade),
    quem: linha.quem || '',
    feitoNaPlanilha: /^s/i.test(linha.feito || '') // "sim" conta como feito
  };
}

// ------------------------------------------------------------
// Gavetas do navegador (localStorage)
// ------------------------------------------------------------

function lerGaveta(nome, valorPadrao) {
  try {
    var texto = localStorage.getItem(nome);
    return texto ? JSON.parse(texto) : valorPadrao;
  } catch (e) {
    return valorPadrao;
  }
}

function guardarGaveta(nome, valor) {
  try {
    localStorage.setItem(nome, JSON.stringify(valor));
  } catch (e) {
    // Se o navegador não deixar guardar, a tela continua funcionando, só não lembra depois.
  }
}

// ------------------------------------------------------------
// Feito ou não feito
// ------------------------------------------------------------

function estaFeito(item) {
  if (Object.prototype.hasOwnProperty.call(feitos, item.id)) return feitos[item.id];
  return item.feitoNaPlanilha;
}

function acharItem(id) {
  for (var i = 0; i < itens.length; i++) {
    if (itens[i].id === id) return itens[i];
  }
  return null;
}

function alternarFeito(id) {
  var item = acharItem(id);
  if (!item) return;
  feitos[id] = !estaFeito(item);
  guardarGaveta(GAVETA_FEITOS, feitos);
  mostrar();
}

// ------------------------------------------------------------
// Escolher o que é do dia
// ------------------------------------------------------------

function combinaComBusca(item) {
  if (!textoBusca) return true;
  var descricao = semAcento(item.descricao.toLowerCase());
  return descricao.indexOf(semAcento(textoBusca.toLowerCase())) >= 0;
}

// Compromissos do dia escolhido, em ordem de horário
function compromissosDoDia() {
  return itens
    .filter(function (i) { return i.tipo === 'compromisso' && i.data === diaEscolhido; })
    .sort(function (a, b) { return (a.hora || '99:99').localeCompare(b.hora || '99:99'); });
}

// Tarefas do dia escolhido + tarefas de dias anteriores que ainda não foram feitas
function tarefasDoDia() {
  return itens.filter(function (i) {
    if (i.tipo !== 'tarefa') return false;
    if (i.data === diaEscolhido) return true;
    return i.data !== '' && i.data < diaEscolhido && !estaFeito(i);
  });
}

// Quantos minutos faltam para o compromisso. Só vale para o dia de hoje.
// Devolve null se não der para saber. Negativo se já passou.
function minutosAte(item) {
  if (!item.hora || diaEscolhido !== dataHojeISO()) return null;
  return horaEmMinutos(item.hora) - agoraEmMinutos();
}

// O próximo compromisso que ainda não passou e não foi feito
function proximoCompromisso(lista) {
  for (var i = 0; i < lista.length; i++) {
    if (!lista[i].hora) continue;
    var faltam = minutosAte(lista[i]);
    if (faltam === null || faltam >= 0) return lista[i];
  }
  return null;
}

// ------------------------------------------------------------
// Mostrar na tela
// ------------------------------------------------------------

function texto(id, valor) {
  document.getElementById(id).textContent = valor;
}

function tituloDoDia() {
  var p = diaEscolhido.split('-');
  var d = new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
  var nomeDia = d.toLocaleDateString('pt-BR', { weekday: 'long' });
  var prefixo = diaEscolhido === dataHojeISO() ? 'Hoje, ' : '';
  return prefixo + nomeDia + ', ' + isoParaBR(diaEscolhido);
}

function mostrar() {
  var compromissos = compromissosDoDia();
  var tarefas = tarefasDoDia();
  texto('titulo-dia', tituloDoDia());
  mostrarNumeros(compromissos, tarefas);
  mostrarCompromissos(compromissos.filter(combinaComBusca));
  mostrarTarefas(tarefas.filter(combinaComBusca));
}

function mostrarNumeros(compromissos, tarefas) {
  var pendentes = compromissos.filter(function (i) { return !estaFeito(i); });
  var tarefasHoje = tarefas.filter(function (i) { return i.prioridade === 'hoje' && !estaFeito(i); });
  var feitasNoDia = compromissos.concat(tarefas).filter(estaFeito).length;

  texto('n-compromissos', pendentes.length);
  texto('n-tarefas', tarefasHoje.length);
  texto('n-feitas', feitasNoDia);

  var caixa = document.getElementById('caixa-proximo');
  caixa.classList.remove('alerta');

  var proximo = proximoCompromisso(pendentes);
  if (!proximo) {
    texto('n-proximo', '--');
    texto('n-proximo-texto', 'nenhum compromisso a caminho');
    return;
  }

  texto('n-proximo', proximo.hora);
  var faltam = minutosAte(proximo);
  if (faltam === null) {
    texto('n-proximo-texto', 'primeiro: ' + proximo.descricao);
  } else if (faltam <= MINUTOS_AVISO) {
    caixa.classList.add('alerta');
    texto('n-proximo-texto', (faltam === 0 ? 'é agora: ' : 'em ' + faltam + ' min: ') + proximo.descricao);
  } else {
    texto('n-proximo-texto', 'em ' + tempoBonito(faltam) + ': ' + proximo.descricao);
  }
}

function botaoFeito(item, feito) {
  return '<button type="button" class="btn-feito' + (feito ? ' desfazer' : '') +
    '" data-id="' + escapar(item.id) + '">' + (feito ? 'desfazer' : 'feito ✓') + '</button>';
}

function etiquetaQuem(item) {
  if (!item.quem) return '';
  return ' <span class="etiqueta">' + escapar(item.quem) + '</span>';
}

function mostrarCompromissos(lista) {
  var ul = document.getElementById('lista-compromissos');
  ul.innerHTML = '';
  if (lista.length === 0) {
    ul.innerHTML = '<li class="vazio">Nenhum compromisso neste dia.</li>';
    return;
  }
  lista.forEach(function (item) {
    var feito = estaFeito(item);
    var faltam = minutosAte(item);
    var classes = ['item'];
    var etiqueta = '';

    if (feito) {
      classes.push('feito');
    } else if (faltam !== null && faltam >= 0 && faltam <= MINUTOS_AVISO) {
      classes.push('alerta');
      etiqueta = faltam === 0 ? 'é agora!' : 'começa em ' + faltam + ' min';
    } else if (faltam !== null && faltam < 0) {
      classes.push('passou');
      etiqueta = 'já passou';
    }

    var li = document.createElement('li');
    li.className = classes.join(' ');
    li.innerHTML =
      '<span class="hora">' + (item.hora || '--:--') + '</span>' +
      '<span class="descricao">' + escapar(item.descricao) + etiquetaQuem(item) +
        (etiqueta ? ' <span class="etiqueta-alerta">' + etiqueta + '</span>' : '') +
      '</span>' +
      botaoFeito(item, feito);
    ul.appendChild(li);
  });
}

function mostrarTarefas(lista) {
  preencherListaTarefas(
    'lista-hoje',
    lista.filter(function (i) { return i.prioridade === 'hoje'; }),
    'Nada para hoje. Bom sinal!'
  );
  preencherListaTarefas(
    'lista-esperar',
    lista.filter(function (i) { return i.prioridade === 'esperar'; }),
    'Nada esperando.'
  );
}

function preencherListaTarefas(idLista, lista, textoVazio) {
  var ul = document.getElementById(idLista);
  ul.innerHTML = '';

  // Pendentes primeiro, feitas no fim. Entre pendentes, as mais antigas primeiro.
  lista.sort(function (a, b) {
    var fa = estaFeito(a) ? 1 : 0;
    var fb = estaFeito(b) ? 1 : 0;
    if (fa !== fb) return fa - fb;
    return a.data.localeCompare(b.data);
  });

  if (lista.length === 0) {
    ul.innerHTML = '<li class="vazio">' + textoVazio + '</li>';
    return;
  }

  lista.forEach(function (item) {
    var feito = estaFeito(item);
    var li = document.createElement('li');
    li.className = 'item' + (feito ? ' feito' : '');
    var ficouDe = '';
    if (item.data < diaEscolhido) {
      ficouDe = ' <span class="etiqueta atrasada">ficou de ' + isoParaCurta(item.data) + '</span>';
    }
    li.innerHTML =
      '<span class="descricao">' + escapar(item.descricao) + etiquetaQuem(item) + ficouDe + '</span>' +
      botaoFeito(item, feito);
    ul.appendChild(li);
  });
}

// ------------------------------------------------------------
// Entender o que a pessoa digitou
// ------------------------------------------------------------

// Lê o texto do jeito que a pessoa fala e descobre se tem hora e dia.
// "ligar pro posto às 14h"  -> compromisso, 14:00, hoje
// "cotar pneu amanhã"       -> tarefa, amanhã
function interpretarTexto(textoDigitado) {
  var resultado = {
    descricao: textoDigitado.trim(),
    data: diaEscolhido,
    hora: '',
    tipo: 'tarefa'
  };

  // "amanhã" joga para o dia seguinte ao de hoje
  if (/amanh[ãa]/i.test(textoDigitado)) {
    resultado.data = somarDias(dataHojeISO(), 1);
  }

  // Procura um horário: "14h", "14h30", "14:30", "às 9"
  var m = textoDigitado.match(/(\d{1,2})\s*(?:h(?![a-z])|:)\s*(\d{2})?/i) ||
          textoDigitado.match(/\b[àa]s?\s+(\d{1,2})\b/i);
  if (m) {
    var h = parseInt(m[1], 10);
    var min = m[2] ? parseInt(m[2], 10) : 0;
    if (h <= 23 && min <= 59) {
      resultado.hora = doisDigitos(h) + ':' + doisDigitos(min);
      resultado.tipo = 'compromisso';
    }
  }
  return resultado;
}

function avisarForm(mensagem) {
  texto('aviso-form', mensagem);
}

function avisarRodape(mensagem) {
  texto('aviso-rodape', mensagem);
}

function guardarNovo(evento) {
  evento.preventDefault();
  var campo = document.getElementById('texto');
  var digitado = campo.value.trim();
  if (!digitado) {
    avisarForm('Escreva alguma coisa primeiro.');
    campo.focus();
    return;
  }

  var lido = interpretarTexto(digitado);
  var novo = {
    id: 'novo-' + Date.now(),
    tipo: lido.tipo,
    descricao: lido.descricao,
    data: lido.data,
    hora: lido.hora,
    prioridade: document.getElementById('prioridade').value,
    quem: 'Eu',
    feitoNaPlanilha: false
  };

  itens.push(novo);
  var novos = lerGaveta(GAVETA_NOVOS, []);
  novos.push(novo);
  guardarGaveta(GAVETA_NOVOS, novos);

  campo.value = '';
  campo.focus();

  if (novo.tipo === 'compromisso') {
    avisarForm('Guardei como compromisso às ' + novo.hora + ' em ' + isoParaBR(novo.data) + '.');
  } else {
    var nomeLista = novo.prioridade === 'hoje' ? 'faço hoje' : 'pode esperar';
    avisarForm('Guardei como tarefa em "' + nomeLista + '" para ' + isoParaBR(novo.data) + '.');
  }
  mostrar();
}

// ------------------------------------------------------------
// Agenda para o sócio
// ------------------------------------------------------------

function textoAgenda() {
  var linhas = ['Agenda de ' + isoParaBR(diaEscolhido) + ' - Stefani Transporte', ''];

  linhas.push('Compromissos:');
  var compromissos = compromissosDoDia().filter(function (i) { return !estaFeito(i); });
  if (compromissos.length === 0) linhas.push('- nenhum');
  compromissos.forEach(function (i) {
    linhas.push('- ' + (i.hora || 'sem hora') + ' ' + i.descricao + (i.quem ? ' (' + i.quem + ')' : ''));
  });

  linhas.push('');
  linhas.push('Tarefas de hoje:');
  var tarefas = tarefasDoDia().filter(function (i) { return i.prioridade === 'hoje' && !estaFeito(i); });
  if (tarefas.length === 0) linhas.push('- nenhuma');
  tarefas.forEach(function (i) {
    linhas.push('- ' + i.descricao);
  });

  return linhas.join('\n');
}

function copiarAgenda() {
  var conteudo = textoAgenda();
  var area = document.getElementById('area-agenda');
  area.value = conteudo;
  document.getElementById('painel-agenda').classList.remove('escondido');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(conteudo).then(
      function () { avisarRodape('Agenda copiada. É só colar no WhatsApp do sócio.'); },
      function () { area.select(); avisarRodape('Não consegui copiar sozinho. Copie o texto da caixa.'); }
    );
  } else {
    area.select();
    avisarRodape('Copie o texto da caixa.');
  }
}

function fecharAgenda() {
  document.getElementById('painel-agenda').classList.add('escondido');
}

function apagarOQueDigitei() {
  var confirmou = confirm('Apagar o que foi digitado e marcado nesta tela? A planilha não muda.');
  if (!confirmou) return;
  try {
    localStorage.removeItem(GAVETA_NOVOS);
    localStorage.removeItem(GAVETA_FEITOS);
  } catch (e) {
    // sem problema
  }
  location.reload();
}

// ------------------------------------------------------------
// Carregar a planilha
// ------------------------------------------------------------

function mostrarErro(erro) {
  var caixa = document.getElementById('erro');
  caixa.classList.remove('escondido');
  var mensagem = '<strong>Não consegui ler a planilha ' + escapar(ARQUIVO_PLANILHA) + '.</strong> ';
  if (location.protocol === 'file:') {
    mensagem += 'O navegador bloqueia a leitura de arquivos quando a página é aberta direto da pasta. ' +
      'Abra o terminal nesta pasta, rode <code>npx serve .</code> e entre no endereço que aparecer, ' +
      'normalmente <code>http://localhost:3000</code>.';
  } else {
    mensagem += 'Confira se o arquivo existe dentro da pasta <code>dados</code>. ' +
      'Detalhe: ' + escapar(String(erro && erro.message ? erro.message : erro));
  }
  caixa.innerHTML = mensagem;
}

function carregar() {
  feitos = lerGaveta(GAVETA_FEITOS, {});
  var novos = lerGaveta(GAVETA_NOVOS, []);

  fetch(ARQUIVO_PLANILHA)
    .then(function (resposta) {
      if (!resposta.ok) throw new Error('resposta ' + resposta.status);
      return resposta.text();
    })
    .then(function (conteudo) {
      itens = lerCSV(conteudo).map(linhaParaItem).concat(novos);
      mostrar();
    })
    .catch(function (erro) {
      mostrarErro(erro);
      itens = novos; // mostra pelo menos o que a pessoa digitou
      mostrar();
    });
}

// ------------------------------------------------------------
// Ligar os botões e começar
// ------------------------------------------------------------

function atualizarRelogio() {
  texto('relogio', horaAgoraTexto());
}

function iniciar() {
  diaEscolhido = dataHojeISO();

  var campoDia = document.getElementById('dia');
  campoDia.value = diaEscolhido;
  campoDia.addEventListener('change', function () {
    if (campoDia.value) {
      diaEscolhido = campoDia.value;
      mostrar();
    }
  });

  document.getElementById('btn-hoje').addEventListener('click', function () {
    diaEscolhido = dataHojeISO();
    campoDia.value = diaEscolhido;
    mostrar();
  });

  document.getElementById('busca').addEventListener('input', function (ev) {
    textoBusca = ev.target.value.trim();
    mostrar();
  });

  document.getElementById('form-novo').addEventListener('submit', guardarNovo);
  document.getElementById('btn-socio').addEventListener('click', copiarAgenda);
  document.getElementById('btn-copiar-de-novo').addEventListener('click', copiarAgenda);
  document.getElementById('btn-fechar-agenda').addEventListener('click', fecharAgenda);
  document.getElementById('btn-limpar').addEventListener('click', apagarOQueDigitei);

  // Um só "ouvinte" para todos os botões de feito, mesmo os que ainda vão aparecer
  document.addEventListener('click', function (ev) {
    var botao = ev.target.closest('.btn-feito');
    if (botao) alternarFeito(botao.getAttribute('data-id'));
  });

  atualizarRelogio();
  setInterval(atualizarRelogio, 15000);   // relógio a cada 15 segundos
  setInterval(mostrar, 60000);            // refaz a tela a cada minuto, para o aviso de 30 min ficar certo

  carregar();
}

document.addEventListener('DOMContentLoaded', iniciar);
