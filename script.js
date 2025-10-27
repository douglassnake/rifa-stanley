// ==========================
// Inicialização Firebase
// ==========================
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();
}

let useFirebase = typeof db !== 'undefined' && db !== null;

// ==========================
// Elementos do DOM
// ==========================
const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const reservaForm = document.getElementById("reservaForm");
const numeroSelecionadoEl = document.getElementById("numeroSelecionado");
const grid = document.querySelector(".grid");

let numeroSelecionado = null;

// ==========================
// Geração da Grade
// ==========================
const totalNumeros = 250;
for (let i = 1; i <= totalNumeros; i++) {
  const numeroEl = document.createElement("div");
  numeroEl.classList.add("numero", "disponivel");
  numeroEl.textContent = i;

  numeroEl.addEventListener("click", () => {
    if (numeroEl.classList.contains("vendido") || numeroEl.classList.contains("reservado")) {
      alert("Este número já foi reservado.");
      return;
    }
    numeroSelecionado = i;
    numeroSelecionadoEl.textContent = i;
    modal.classList.remove("hidden");
  });

  grid.appendChild(numeroEl);
}

// ==========================
// Fechar modal
// ==========================
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  reservaForm.reset();
  numeroSelecionado = null;
});

// ==========================
// Enviar Reserva
// ==========================
reservaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("🚀 Enviando reserva...");

  const nome = document.getElementById("nome").value.trim();
  const telefone = document.getElementById("telefone").value.trim();

  if (!nome || !telefone || !numeroSelecionado) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  if (useFirebase) {
    try {
      console.log("🔥 Gravando no Firestore...");
      const numeroRef = db.collection("rifa").doc(numeroSelecionado.toString());
      await numeroRef.set({
        numero: numeroSelecionado,
        nome: nome,
        telefone: telefone,
        status: "Pendente",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log("✅ Número reservado com sucesso!");
      alert(`Número ${numeroSelecionado} reservado com sucesso!`);

      const numeroEl = Array.from(grid.children).find(el => el.textContent == numeroSelecionado);
      if (numeroEl) {
        numeroEl.classList.remove("disponivel");
        numeroEl.classList.add("reservado");
      }

      modal.classList.add("hidden");
      reservaForm.reset();
      numeroSelecionado = null;

    } catch (error) {
      console.error("❌ Erro ao salvar reserva:", error);
      alert("Ocorreu um erro ao salvar a reserva. Verifique as permissões do Firestore.");
    }
  } else {
    alert(⚠️ Firebase não configurado corretamente.");
  }
});

// ==========================
// Leitura em tempo real
// ==========================
if (useFirebase) {
  db.collection("rifa").onSnapshot(snapshot => {
    snapshot.forEach(doc => {
      const data = doc.data();
      const numeroEl = Array.from(grid.children).find(el => el.textContent == data.numero);
      if (numeroEl) {
        numeroEl.classList.remove("disponivel");
        numeroEl.classList.add("reservado");
      }
    });
  });
}
