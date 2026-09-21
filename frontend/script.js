const API = "http://localhost:3002";
let agendamentosCache = [];

const $ = id => document.getElementById(id);

function escapeHTML(valor = "") {
    return String(valor).replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
}

function formatarData(valor) {
    if (!valor) return "Horário não informado";
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function mostrarToast(mensagem) {
    const toast = $("toast");
    toast.textContent = mensagem;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

function selecionarServico(servico) {
    $("servico").value = servico;
    $("agendar").scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => $("pet").focus(), 500);
}

function renderizarAgendamentos(lista = agendamentosCache) {
    const termo = $("busca").value.trim().toLowerCase();
    const filtrados = lista.filter(a =>
        String(a.pet || "").toLowerCase().includes(termo) ||
        String(a.tutor || "").toLowerCase().includes(termo) ||
        String(a.servico || "").toLowerCase().includes(termo)
    );

    $("contador").textContent = filtrados.length;
    $("totalHero").textContent = lista.length;

    if (!filtrados.length) {
        $("lista").innerHTML = `<div class="vazio">${termo ? "Nenhum atendimento encontrado para essa busca." : "Ainda não há agendamentos. O primeiro atendimento pode ser cadastrado acima."}</div>`;
        return;
    }

    $("lista").innerHTML = filtrados.map(a => `
        <article class="agendamento">
            <div class="agendamento-main">
                <strong>🐾 ${escapeHTML(a.pet)}</strong>
                <span>Tutor: ${escapeHTML(a.tutor)}</span>
                <span>${escapeHTML(a.especie || "Pet")} ${a.raca ? "• " + escapeHTML(a.raca) : ""}</span>
            </div>
            <div class="agendamento-meta">
                <span class="status">AGENDADO</span>
                <span>${escapeHTML(a.servico || "Atendimento")}</span>
                <span>${formatarData(a.data_hora)}</span>
            </div>
        </article>
    `).join("");
}

async function carregarAgendamentos() {
    try {
        const resposta = await fetch(`${API}/agendamentos`);
        if (!resposta.ok) throw new Error();
        agendamentosCache = await resposta.json();
        renderizarAgendamentos();
    } catch {
        $("lista").innerHTML = '<div class="erro">Não foi possível conectar ao servidor. Verifique se os containers estão rodando.</div>';
    }
}

async function salvarAgendamento(evento) {
    evento.preventDefault();
    const botao = $("submitBtn");
    botao.disabled = true;
    botao.innerHTML = "Salvando...";

    const dados = {
        pet: $("pet").value.trim(),
        tutor: $("tutor").value.trim(),
        telefone: $("telefone").value.trim(),
        especie: $("especie").value,
        raca: $("raca").value.trim(),
        servico: $("servico").value,
        data_hora: $("data").value,
        observacoes: $("observacoes").value.trim()
    };

    if (!dados.pet || !dados.tutor || !dados.telefone || !dados.servico || !dados.data_hora) {
        mostrarToast("Preencha os campos obrigatórios.");
        botao.disabled = false;
        botao.innerHTML = 'Confirmar agendamento <span>→</span>';
        return;
    }

    try {
        const resposta = await fetch(`${API}/agendamentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });
        const resultado = await resposta.json();
        if (!resposta.ok) throw new Error(resultado.erro || "Falha ao salvar");
        $("agendamentoForm").reset();
        mostrarToast("Agendamento confirmado com sucesso! 🐾");
        await carregarAgendamentos();
        $("agenda").scrollIntoView({ behavior: "smooth" });
    } catch (erro) {
        mostrarToast(erro.message || "Não foi possível salvar o agendamento.");
    } finally {
        botao.disabled = false;
        botao.innerHTML = 'Confirmar agendamento <span>→</span>';
    }
}

$("agendamentoForm").addEventListener("submit", salvarAgendamento);
$("busca").addEventListener("input", () => renderizarAgendamentos());
carregarAgendamentos();
