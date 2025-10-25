// ========== GERADOR DE NÚMEROS E RESERVAS ========== //
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const form = document.getElementById('reserva-form');
const numeroSelecionadoInput = document.getElementById('numero-selecionado');

let numeros = [];

// Cria 250 números disponíveis
for (let i = 1; i <= 250; i++) {
  numeros.push({
    numero: i.toString().padStart(3, '0'),
    status: 'disponivel',
    comprador: null
  });
}

// Renderiza a grade
function renderGrid() {
  grid.innerHTML = '';
  numeros.forEach(n => {
    const div = document.createElement('div');
    div.classList.add('numero', n.status);
    div.textContent = n.numero;

    if (n.status === 'disponivel') {
      div.addEventListener('click', () => abrirModal(n.numero));
    }

    grid.appendChild(div);
  });
}

renderGrid();

// Abre modal de reserva
function abrirModal(numero) {
  numeroSelecionadoInput.value = numero;
  modal.classList.remove('hidden');
}

// Fecha modal
function fecharModal() {
  modal.classList.add('hidden');
  form.reset();
}

// Salva reserva localmente (pode ser depois no Firebase)
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const numero = numeroSelecionadoInput.value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;
  const arquivo = document.getElementById('comprovante').files[0];

  if (!arquivo) {
    alert('Por favor, envie o comprovante de pagamento.');
    return;
  }

  const index = numeros.findIndex(n => n.numero === numero);
  if (index !== -1) {
    numeros[index].status = 'reservado';
    numeros[index].comprador = { nome, whatsapp, arquivoNome: arquivo.name };
    renderGrid();
    fecharModal();
    alert(`Número ${numero} reservado com sucesso!`);
  }
});

// ========== NO FUTURO: INTEGRAR COM FIREBASE PARA SALVAR ONLINE ==========