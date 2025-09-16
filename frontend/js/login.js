document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const senha = document.getElementById('loginSenha').value;
  const msg = document.getElementById('loginMsg');
  msg.textContent = '';

  try {
    const res = await fetch('http://localhost:3001/api/usuarios/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      msg.style.color = '#2d3e50';
      msg.textContent = 'Login realizado com sucesso!';
      setTimeout(() => window.location.href = 'grupos.html', 1200);
    } else {
      msg.textContent = data.mensagem || 'E-mail ou senha inválidos.';
    }
  } catch {
    msg.textContent = 'Erro ao conectar ao servidor.';
  }
});
