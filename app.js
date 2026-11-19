const CHAVE_ORDENS = "fila-servicos-ordens";
const STATUS = ["Recebido", "Em andamento", "Pronto", "Entregue"];

const formulario = document.querySelector("#form-servico");
const lista = document.querySelector("#lista-ordens");
const totalOrdens = document.querySelector("#total-ordens");
const mensagem = document.querySelector("#mensagem");
const campoBusca = document.querySelector("#buscar");
const filtros = document.querySelectorAll(".filtro");
const tituloCadastro = document.querySelector("#titulo-cadastro");
const botaoSalvar = document.querySelector("#botao-salvar");
const botaoCancelar = document.querySelector("#botao-cancelar");
const contadores = {
  Recebido: document.querySelector("#contador-recebido"),
  "Em andamento": document.querySelector("#contador-andamento"),
  Pronto: document.querySelector("#contador-pronto"),
  Entregue: document.querySelector("#contador-entregue")
};
let statusAtivo = "Todas";
let indiceEmEdicao = null;

function lerOrdens() {
  return JSON.parse(localStorage.getItem(CHAVE_ORDENS)) || [];
}

function salvarOrdens(ordens) {
  localStorage.setItem(CHAVE_ORDENS, JSON.stringify(ordens));
}

function classeDoStatus(status) {
  return {
    Recebido: "recebido",
    "Em andamento": "andamento",
    Pronto: "pronto",
    Entregue: "entregue"
  }[status];
}

function criarOrdem(ordem, indice) {
  const item = document.createElement("article");
  item.className = "ordem";
  const topo = document.createElement("div");
  topo.className = "ordem-topo";
  const dados = document.createElement("div");
  const codigo = document.createElement("p");
  codigo.className = "codigo";
  codigo.textContent = `OS #${String(indice + 1).padStart(4, "0")}`;
  const cliente = document.createElement("h3");
  cliente.textContent = ordem.cliente;
  const seletorStatus = document.createElement("select");
  seletorStatus.className = `status-select ${classeDoStatus(ordem.status)}`;
  seletorStatus.dataset.indice = indice;
  seletorStatus.setAttribute("aria-label", `Status da ordem de ${ordem.cliente}`);

  STATUS.forEach((status) => {
    const opcao = document.createElement("option");
    opcao.value = status;
    opcao.textContent = status;
    opcao.selected = status === ordem.status;
    seletorStatus.append(opcao);
  });
  const aparelho = document.createElement("p");
  aparelho.className = "aparelho";
  aparelho.textContent = ordem.aparelho;
  const problema = document.createElement("p");
  problema.className = "problema";
  problema.textContent = ordem.problema;
  const rodape = document.createElement("div");
  rodape.className = "ordem-rodape";
  const telefone = document.createElement("span");
  telefone.textContent = ordem.telefone;
  const acoes = document.createElement("div");
  acoes.className = "acoes-ordem";
  const botaoEditar = document.createElement("button");
  botaoEditar.type = "button";
  botaoEditar.className = "botao-editar";
  botaoEditar.dataset.indice = indice;
  botaoEditar.textContent = "Editar";
  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "botao-excluir";
  botaoExcluir.dataset.indice = indice;
  botaoExcluir.textContent = "Excluir";

  dados.append(codigo, cliente);
  topo.append(dados, seletorStatus);
  acoes.append(botaoEditar, botaoExcluir);
  rodape.append(telefone, acoes);
  item.append(topo, aparelho, problema);

  if (ordem.observacoes) {
    const observacoes = document.createElement("p");
    observacoes.className = "problema";
    observacoes.textContent = `Observações: ${ordem.observacoes}`;
    item.append(observacoes);
  }

  item.append(rodape);
  return item;
}

function atualizarContadores(ordens) {
  STATUS.forEach((status) => {
    contadores[status].textContent = ordens.filter((ordem) => ordem.status === status).length;
  });
}

function encerrarEdicao() {
  indiceEmEdicao = null;
  formulario.reset();
  tituloCadastro.textContent = "Cadastrar serviço";
  botaoSalvar.textContent = "Cadastrar serviço";
  botaoCancelar.hidden = true;
}

function mostrarOrdens() {
  const ordens = lerOrdens();
  atualizarContadores(ordens);
  const termo = campoBusca.value.trim().toLocaleLowerCase("pt-BR");
  const ordensFiltradas = ordens
    .map((ordem, indice) => ({ ordem, indice }))
    .filter(({ ordem }) => {
      const correspondeBusca = !termo || ordem.cliente.toLocaleLowerCase("pt-BR").includes(termo) || ordem.aparelho.toLocaleLowerCase("pt-BR").includes(termo);
      const correspondeStatus = statusAtivo === "Todas" || ordem.status === statusAtivo;
      return correspondeBusca && correspondeStatus;
    });

  lista.replaceChildren();
  totalOrdens.textContent = `${ordensFiltradas.length} ${ordensFiltradas.length === 1 ? "ordem" : "ordens"}`;

  if (!ordensFiltradas.length) {
    const aviso = document.createElement("p");
    aviso.className = "vazio";
    aviso.textContent = ordens.length ? "Nenhuma ordem encontrada." : "Nenhuma ordem cadastrada ainda.";
    lista.append(aviso);
    return;
  }

  ordensFiltradas.forEach(({ ordem, indice }) => lista.append(criarOrdem(ordem, indice)));
}

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const dados = new FormData(formulario);
  const dadosDoServico = Object.fromEntries(dados.entries());
  const ordens = lerOrdens();

  if (indiceEmEdicao === null) {
    ordens.unshift(dadosDoServico);
    mensagem.textContent = "Serviço cadastrado com sucesso.";
  } else {
    ordens[indiceEmEdicao] = dadosDoServico;
    mensagem.textContent = "Serviço atualizado com sucesso.";
  }
  salvarOrdens(ordens);
  encerrarEdicao();
  mostrarOrdens();
});

botaoCancelar.addEventListener("click", encerrarEdicao);

campoBusca.addEventListener("input", mostrarOrdens);

filtros.forEach((filtro) => {
  filtro.addEventListener("click", () => {
    statusAtivo = filtro.dataset.status;
    filtros.forEach((botao) => {
      const ativo = botao === filtro;
      botao.classList.toggle("ativo", ativo);
      botao.setAttribute("aria-pressed", ativo);
    });
    mostrarOrdens();
  });
});

lista.addEventListener("change", (evento) => {
  if (!evento.target.matches(".status-select")) return;

  const ordens = lerOrdens();
  const indice = Number(evento.target.dataset.indice);
  ordens[indice].status = evento.target.value;
  salvarOrdens(ordens);
  mensagem.textContent = "Status atualizado com sucesso.";
  mostrarOrdens();
});

lista.addEventListener("click", (evento) => {
  const botao = evento.target.closest("button");
  if (!botao) return;

  const indice = Number(botao.dataset.indice);
  const ordens = lerOrdens();

  if (botao.matches(".botao-editar")) {
    const ordem = ordens[indice];
    indiceEmEdicao = indice;
    formulario.elements.cliente.value = ordem.cliente;
    formulario.elements.telefone.value = ordem.telefone;
    formulario.elements.aparelho.value = ordem.aparelho;
    formulario.elements.problema.value = ordem.problema;
    formulario.elements.observacoes.value = ordem.observacoes;
    formulario.elements.status.value = ordem.status;
    tituloCadastro.textContent = "Editar serviço";
    botaoSalvar.textContent = "Salvar alterações";
    botaoCancelar.hidden = false;
    document.querySelector("#cadastro").scrollIntoView({ behavior: "smooth" });
    return;
  }

  if (botao.matches(".botao-excluir") && confirm("Excluir este serviço? Esta ação não pode ser desfeita.")) {
    ordens.splice(indice, 1);
    salvarOrdens(ordens);
    if (indiceEmEdicao === indice) encerrarEdicao();
    if (indiceEmEdicao !== null && indice < indiceEmEdicao) indiceEmEdicao -= 1;
    mensagem.textContent = "Serviço excluído com sucesso.";
    mostrarOrdens();
  }
});

mostrarOrdens();
