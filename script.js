// ========================
// GERAÇÃO DA GRADE DE NÚMEROS
// ========================
const grid = document.getElementById('grid');
const totalNumeros = 250;

function formatNumero(n) {
  return n.toString().padStart(3, '0');
}

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
let useFirebase = typeof db !== 'undefined' && db !== null && typeof storage !== 'undefined' && storage !== null;
console.log("🔥 Firebase ativo?", useFirebase);

// ========================
// FORM DE RESERVA COM UPLOAD
// ========================
document.getElementById('reserva-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const numero = numeroSelecionadoInput.value;
  const nome = document.getElementById('nome').value;
  const whatsapp = document.getElementById('whatsapp').value;
  const file = document.getElementById('comprovante').files[0];

  let comprovanteURL = null;

  // 📤 Upload no Storage
  if (useFirebase && file) {
    try {
      const storageRef = storage.ref(`comprovantes/${numero}_${Date.now()}_${file.name}`);
      await storageRef.put(file);
      comprovanteURL = await storageRef.getDownloadURL();
      console.log("📎 Comprovante enviado:", comprovanteURL);
    } catch (err) {
      console.error("❌ Erro ao enviar comprovante:", err);
      alert("Falha ao enviar o comprovante. Tente novamente.");
      return;
    }
  }

  // 📝 Salvar no Firestore
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
        comprovante: comprovanteURL,
        status: "reservado",
        timestamp: new Date().toISOString()
      };

      await docRef.set(data);
      console.log(`📌 Número ${numero} reservado no Firebase para ${nome}`);
    } catch (err) {
      console.error("🔥 Erro ao salvar no Firestore:", err);
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
// ATUALIZAÇÃO EM TEMPO REAL
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

// ========================
// COPIAR PIX
// ========================
(function(){
  const copyBtn = document.getElementById('copy-pix');
  const pixKeyEl = document.getElementById('pix-key');
  const toast = document.getElementById('pix-toast');

  if (!copyBtn || !pixKeyEl || !toast) return;

  async function showToast(msg = "Chave PIX copiada!") {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (e) {}
    }
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (e) {
      return false;
    }
  }

  copyBtn.addEventListener('click', async () => {
    const chave = pixKeyEl.textContent.trim();
    const ok = await copyTextToClipboard(chave);
    if (ok) {
      showToast('Chave PIX copiada!');
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copiado ✅';
      copyBtn.disabled = true;
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.disabled = false;
      }, 1800);
    } else {
      alert('Não foi possível copiar automaticamente. Selecione e copie manualmente: ' + chave);
    }
  });
})();