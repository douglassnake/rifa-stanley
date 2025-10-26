// ✅ Inicialização Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

// ⚙️ Configuração do seu projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAmIKqT6FKAlOJXvBMop89kATekUsy4yR0",
  authDomain: "rifa-stanley.firebaseapp.com",
  projectId: "rifa-stanley",
  storageBucket: "rifa-stanley.firebasestorage.app",
  messagingSenderId: "811838072733",
  appId: "1:811838072733:web:c380ce75a40d1b90ca3174",
  measurementId: "G-L9C0JX7ZNJ"
};

// 🚀 Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ script.js carregado com Firebase!");

// 📲 Aguarda DOM carregar
document.addEventListener('DOMContentLoaded', () => {
  console.log("⏳ DOM carregado, iniciando grade...");
  const grid = document.getElementById('grid');
  const totalNumeros = 250;

  // Cria os botões dos números
  for (let i = 1; i <= totalNumeros; i++) {
    const numero = i.toString().padStart(3, '0');
    const btn = document.createElement('button');
    btn.textContent = numero;
    btn.className = 'numero disponivel';
    btn.id = `num-${numero}`;
    btn.addEventListener('click', () => abrirModal(numero));
    grid.appendChild(btn);
  }

  // 🔄 Listener em tempo real no Firestore
  onSnapshot(doc(db, "rifa", "numeros"), (docSnap) => {
    if (docSnap.exists()) {
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

// 🟢 Abre modal
function abrirModal(numero) {
  const modal = document.getElementById('modal');
  const numeroInput = document.getElementById('numero-selecionado');
  numeroInput.value = numero;
  modal.classList.remove('hidden');
}

// ❌ Fecha modal
function fecharModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
}

// 📝 Reserva número no Firestore
document.getElementById('reserva-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = document.getElementById('numero-selecionado').value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;

  const numeroDoc = doc(db, "rifa", "numeros");
  const docSnap = await getDoc(numeroDoc);

  let numerosData = {};
  if (docSnap.exists()) {
    numerosData = docSnap.data();
  }

  // ⚠️ Verifica se número já foi reservado
  if (numerosData[numero] && numerosData[numero].status !== 'disponivel') {
    alert("Esse número já foi reservado ou vendido.");
    fecharModal();
    return;
  }

  numerosData[numero] = {
    nome: nome,
    whatsapp: whatsapp,
    status: "reservado",
    timestamp: new Date().toISOString()
  };

  await setDoc(numeroDoc, numerosData);
  console.log(`📌 Número ${numero} reservado para ${nome} (${whatsapp})`);

  fecharModal();
});
