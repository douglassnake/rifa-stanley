// ========== INTEGRAÇÃO FIREBASE FIRESTORE ========== //
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const form = document.getElementById('reserva-form');
const numeroSelecionadoInput = document.getElementById('numero-selecionado');

// Referência ao Firestore
const reservasRef = firebase.firestore().collection('reservas');

let numeros = [];

// Cria 250 números disponíveis
for (let i = 1; i <= 250; i++) {
  numeros.push({
    numero: i.toString().padStart(3, '0'),
    status: 'disponivel',
    comprador: null
  });
}

// ========== ATUALIZAÇÃO EM TEMPO REAL ========== //
reservasRef.onSnapshot(snapshot => {
  snapshot.forEach(doc => {
    const numero = doc.id;
    const data = doc.data();
    const index = numeros.findIndex(n => n.numero === numero);
    if (index !== -1) {
      numeros[index].status = data.status;
      numeros[index].comprador = data.comprador;
    }
  });
  renderGrid();
});

// ========== RENDERIZA GRADE ========== //
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

// ========== MODAL ========== //
function abrirModal(numero) {
  numeroSelecionadoInput.value = numero;
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
  form.reset();
}

// ========== RESERVAR NÚMERO NO FIRESTORE ========== //
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = numeroSelecionadoInput.value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;
  const arquivo = document.getElementById('comprovante').files[0];

  if (!arquivo) {
    alert('Por favor, envie o comprovante de pagamento.');
    return;
  }

  try {
    await reservasRef.doc(numero).set({
      status: 'reservado',
      comprador: { nome, whatsapp, arquivoNome: arquivo.name },
      timestamp: new Date()
    });
    fecharModal();
    alert(`Número ${numero} reservado com sucesso!`);
  } catch (error) {
    alert('Erro ao reservar número. Tente novamente.');
    console.error(error);
  }
});
