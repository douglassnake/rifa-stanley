// Confirma se o script foi carregado
console.log("✅ script.js carregado com sucesso!");

// Aguarda a página carregar completamente
document.addEventListener('DOMContentLoaded', () => {
  console.log("⏳ DOM carregado, iniciando grade...");

  const grid = document.getElementById('grid');
  const totalNumeros = 250;

  // Cria os 250 botões
  for (let i = 1; i <= totalNumeros; i++) {
    const numero = i.toString().padStart(3, '0');
    const btn = document.createElement('button');
    btn.textContent = numero;
    btn.className = 'numero';
    btn.addEventListener('click', () => abrirModal(numero));
    grid.appendChild(btn);
  }
});

// Função para abrir modal
function abrirModal(numero) {
  console.log(`🟢 Número ${numero} selecionado`);
  const modal = document.getElementById('modal');
  const numeroInput = document.getElementById('numero-selecionado');
  numeroInput.value = numero;
  modal.classList.remove('hidden');
}

// Função para fechar modal
function fecharModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
}

// Exemplo de reserva (simulação local)
document.getElementById('reserva-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const numero = document.getElementById('numero-selecionado').value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

  console.log(`📌 Reserva feita para ${nome} - Número ${numero} - WhatsApp: ${whatsapp}`);

  // Desativa botão
  const botoes = document.querySelectorAll('.numero');
  botoes.forEach(btn => {
    if (btn.textContent === numero) {
      btn.disabled = true;
      btn.classList.add('reservado');
    }
  });

  fecharModal();
});
