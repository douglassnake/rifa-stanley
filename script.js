// ========================
// GERAÇÃO DA GRADE DE NÚMEROS
// ========================
const grid = document.getElementById('grid');
const totalNumeros = 250;

// Função para formatar números com 3 dígitos (001, 002...)
function formatNumero(n) {
  return n.toString().padStart(3, '0');
}

// Gera os botões da rifa
for (let i = 1; i <= totalNumeros; i++) {
  const numeroFormatado = formatNumero(i);
  const btn = document.createElement('button');
  btn.id = `num-${numeroFormatado}`;
  btn.textContent = numeroFormatado;
  btn.classList.add('numero', 'disponivel');
  btn.addEventListener('click', () => abrirModal(numeroFormatado));
  grid.appendChild(btn);
}

// ========================
// MODAL DE RESERVA
// ========================
const modal = document.getElementById('modal');
const numeroSelecionadoInput = document.getElementById('numero-selecionado');

function abrirModal(numero) {
  numeroSelecionadoInput.value = numero;
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
  numeroSelecionadoInput.value = '';
  document.getElementById('reserva-form').reset();
}

// ========================
// FIREBASE FALLBACK
// ========================
let useFirebase = typeof db !== 'undefined' && db !== null;
console.log("🔥 Firebase ativo?", useFirebase);

// ========================
// FORM DE RESERVA
// ========================
document.getElementById('reserva-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = numeroSelecionadoInput.value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

  if (useFirebase) {
    try {
      const docRef = db.doc("rifa/numeros");
      const snap = await docRef.get();
      let data = snap.exists ? snap.data() : {};

      if (data[numero] && data[numero].status !== 'disponivel') {
        alert("Esse número já foi reservado ou vendido.");
        fecharModal();
        return;
      }

      data[numero] = {
        nome,
        whatsapp,
        status: "reservado",
        timestamp: new Date().toISOString()
      };

      await docRef.set(data);
      console.log(`📌 Número ${numero} reservado no Firebase para ${nome}`);
    } catch (err) {
      console.error("🔥 Erro ao salvar no Firebase:", err);
      alert("Falha ao salvar no servidor. Sua reserva local foi registrada.");
    }
  }

  // Atualiza localmente
  const btn = document.getElementById(`num-${numero}`);
  if (btn) {
    btn.classList.remove('disponivel');
    btn.classList.add('reservado');
    btn.disabled = true;
  }

  fecharModal();
});

// ========================
// ATUALIZAÇÃO EM TEMPO REAL COM FIREBASE
// ========================
if (useFirebase) {
  db.doc("rifa/numeros").onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      Object.keys(data).forEach(numero => {
        const info = data[numero];
        const btn = document.getElementById(`num-${numero}`);
        if (btn) {
          if (info.status === 'reservado') {
            btn.classList.remove('disponivel');
            btn.classList.add('reservado');
            btn.disabled = true;
          } else if (info.status === 'vendido') {
            btn.classList.remove('disponivel');
            btn.classList.add('vendido');
            btn.disabled = true;
          } else {
            btn.classList.remove('reservado', 'vendido');
            btn.classList.add('disponivel');
            btn.disabled = false;
          }
        }
      });
    }
  });
}
