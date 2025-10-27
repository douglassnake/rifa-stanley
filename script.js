// ========================
// ELEMENTOS GERAIS
// ========================
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const numeroSelecionadoInput = document.getElementById('numero-selecionado');
const form = document.getElementById('reserva-form');

const totalNumeros = 250;

// ========================
// FIREBASE FALLBACK
// ========================
let useFirebase = typeof db !== 'undefined' && db !== null;
console.log("🔥 Firebase ativo?", useFirebase);

// ========================
// GERAÇÃO DA GRADE
// ========================
function formatNumero(n) {
  return n.toString().padStart(3, '0');
}

for (let i = 1; i <= totalNumeros; i++) {
  const numeroFormatado = formatNumero(i);
  const div = document.createElement('div');
  div.id = `num-${numeroFormatado}`;
  div.textContent = numeroFormatado;
  div.classList.add('numero', 'disponivel');
  div.addEventListener('click', () => abrirModal(numeroFormatado));
  grid.appendChild(div);
}

// ========================
// MODAL
// ========================
function abrirModal(numero) {
  numeroSelecionadoInput.value = numero;
  modal.classList.remove('hidden');
}

function fecharModal() {
  modal.classList.add('hidden');
  numeroSelecionadoInput.value = '';
  form.reset();
}

// ========================
// FORM DE RESERVA
// ========================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = numeroSelecionadoInput.value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

  // Campo de comprovante opcional
  const fileInput = document.getElementById('comprovante');
  let file = null;
  if (fileInput && fileInput.files.length > 0) {
    file = fileInput.files[0];
  }

  // 🔥 Se Firebase estiver ativo, salva a reserva
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
        timestamp: new Date().toISOString(),
        comprovante: file ? file.name : null // 👈 salva nome do arquivo se houver
      };

      await docRef.set(data);
      console.log(`📌 Número ${numero} reservado no Firebase`);
    } catch (err) {
      console.error("🔥 Erro ao salvar no Firebase:", err);
      alert("Falha ao salvar no servidor. Sua reserva local foi registrada.");
    }
  }

  // Atualiza visualmente na grade
  const div = document.getElementById(`num-${numero}`);
  if (div) {
    div.classList.remove('disponivel');
    div.classList.add('reservado');
  }

  fecharModal();
});

// ========================
// ATUALIZAÇÃO EM TEMPO REAL
// ========================
if (useFirebase) {
  db.doc("rifa/numeros").onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      Object.keys(data).forEach(numero => {
        const info = data[numero];
        const div = document.getElementById(`num-${numero}`);
        if (div) {
          if (info.status === 'reservado') {
            div.classList.remove('disponivel');
            div.classList.add('reservado');
          } else if (info.status === 'vendido') {
            div.classList.remove('disponivel');
            div.classList.add('vendido');
          } else {
            div.classList.remove('reservado', 'vendido');
            div.classList.add('disponivel');
          }
        }
      });
    }
  });
}
