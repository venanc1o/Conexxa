document.getElementById('recuperarForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('recuperarEmail').value;
  const msg = document.getElementById('recuperarMsg');
  msg.textContent = '';

  try {
    const res = await fetch('http://localhost:3001/api/usuarios/esqueci-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) {
      msg.style.color = '#2d3e50';
      msg.textContent = 'Se o e-mail existir, você receberá instruções.';
    } else {
      msg.textContent = data.mensagem || 'Erro ao solicitar recuperação.';
    }
  } catch {
    msg.textContent = 'Erro ao conectar ao servidor.';
  }
});
