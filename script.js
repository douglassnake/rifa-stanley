// ✅ Confirma que o script foi carregado
console.log("✅ script.js compat carregado com sucesso!");

// 🔥 Usa o Firebase já carregado no HTML
const db = firebase.firestore();

// ============================
// 📲 Inicializa grade de números
// ============================
document.addEventListener('DOMContentLoaded', () => {
  console.log("📲 DOM carregado!");
  const grid = document.getElementById('grid');
  const totalNumeros = 250;

  for (let i = 1; i <= totalNumeros; i++) {
    const numero = i.toString().padStart(3, '0');
    const btn = document.createElement('button');
    btn.textContent = numero;
    btn.className = 'numero disponivel';
    btn.id = `num-${numero}`;
    btn.addEventListener('click', () => abrirModal(numero));
    grid.appendChild(btn);
  }

  // ============================
  // 🟡 Listener em tempo real no Firestore
  // ============================
  db.doc("rifa/numeros").onSnapshot((docSnap) => {
    if (docSnap.exists) {
      const data = docSnap.data();
      Object.keys(data).forEach(numero => {
        const info = data[numero];
        const btn = document.getElementById(`num-${numero}`);
        if (btn) {
          if (info.status === 'reservado') {
            btn.className = 'numero reservado';
            btn.disabled = true;
          } else if (info.status === 'vendido') {
            btn.className = 'numero vendido';
            btn.disabled = true;
          } else {
            btn.className = 'numero disponivel';
            btn.disabled = false;
          }
        }
      });
    }
  });
});

// ============================
// 🟢 Funções do Modal
// ============================
function abrirModal(numero) {
  document.getElementById('numero-selecionado').value = numero;
  document.getElementById('modal').classList.remove('hidden');
}

function fecharModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ============================
// 📝 Reserva do número
// ============================
document.getElementById('reserva-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = document.getElementById('numero-selecionado').value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

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
  console.log(`📌 Número ${numero} reservado para ${nome}`);
  fecharModal();
});
