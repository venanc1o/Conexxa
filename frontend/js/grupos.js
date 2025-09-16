// Verifica se está logado
if (!localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// Criação de grupo
const grupoForm = document.getElementById('grupoForm');
const grupoMsg = document.getElementById('grupoMsg');
grupoForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const nomeGrupo = document.getElementById('nomeGrupo').value;
  const materia = document.getElementById('materia').value;
  const descricao = document.getElementById('descricao').value;
  const local = document.getElementById('local').value;
  const dataEncontro = document.getElementById('dataEncontro').value;
  const limiteParticipantes = document.getElementById('limiteParticipantes').value;
  const linkVideoConferencia = document.getElementById('linkVideoConferencia').value;

  grupoMsg.textContent = '';
  try {
    const res = await fetch('http://localhost:3001/api/grupos/criar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ nomeGrupo, materia, descricao, local, dataEncontro, limiteParticipantes, linkVideoConferencia })
    });
    const data = await res.json();
    if (res.status === 201) {
      grupoMsg.style.color = '#2d3e50';
      grupoMsg.textContent = 'Grupo criado com sucesso!';
      // Redireciona para detalhes do grupo (exemplo)
      setTimeout(() => window.location.reload(), 1200);
    } else {
      grupoMsg.textContent = data.mensagem || (data.erros ? data.erros.join(' ') : 'Erro ao criar grupo.');
    }
  } catch {
    grupoMsg.textContent = 'Erro ao conectar ao servidor.';
  }
});

// Exemplo: Listar grupos do usuário (pode ser expandido)
// ...
