document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const nomeCompleto = document.getElementById('nomeCompleto').value;
  const email = document.getElementById('email').value;
  const curso = document.getElementById('curso').value;
  const semestre = document.getElementById('semestre').value;
  const senha = document.getElementById('senha').value;
  const msg = document.getElementById('cadastroMsg');
  msg.textContent = '';

  try {
    const res = await fetch('http://localhost:3001/api/usuarios/cadastro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeCompleto, email, curso, semestre, senha })
    });
    const data = await res.json();
    if (res.status === 201) {
      msg.style.color = '#2d3e50';
      msg.textContent = 'Cadastro realizado com sucesso!';
      setTimeout(() => window.location.href = 'index.html', 1200);
    } else {
      msg.textContent = data.mensagem || (data.erros ? data.erros.join(' ') : 'Erro ao cadastrar.');
    }
  } catch {
    msg.textContent = 'Erro ao conectar ao servidor.';
  }
});
