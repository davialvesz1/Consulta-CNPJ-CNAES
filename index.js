document.getElementById('cnpjForm').addEventListener('submit', async function (event) {
  event.preventDefault(); // Impede o envio padrão do formulário
  const cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');

  const url = `/consultar-cnpj/${cnpj}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorDetails = await response.json();
      alert('Erro na requisição: ' + errorDetails.details);
      return;
    }

    const data = await response.json();

    document.getElementById('nome').innerHTML = `<strong>Nome da Empresa:</strong> ${data.nome}`;
    document.getElementById('situacao').innerHTML = `<strong>Situação Cadastral:</strong> ${data.situacao || "Não informado"}`;
    document.getElementById('data_situacao').innerHTML = `<strong>Data da Situação Cadastral:</strong> ${data.data_situacao || "Não informado"}`;
    document.getElementById('uf').innerHTML = `<strong>UF:</strong> ${data.uf}`;
    document.getElementById('municipio').innerHTML = `<strong>Município:</strong> ${data.municipio || "Não informado"}`;


    const cnaePrincipal = data['atividade_principal'] ? data['atividade_principal'][0] : null;
    document.getElementById('cnaePrincipal').innerText = cnaePrincipal
      ? `${cnaePrincipal.code} - ${cnaePrincipal.text}`
      : "CNAE Principal não encontrado.";

    const cnaesSecundariosList = document.getElementById('cnaesSecundarios');
    cnaesSecundariosList.innerHTML = "";

    if (data['atividades_secundarias'] && data['atividades_secundarias'].length > 0) {
      data['atividades_secundarias'].forEach(atividade => {
        const li = document.createElement('li');
        li.textContent = `${atividade.code} - ${atividade.text}`;
        cnaesSecundariosList.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = "Nenhum CNAE secundário encontrado.";
      cnaesSecundariosList.appendChild(li);
    }

    // SIMPLES NACIONAL
    const simples = data.simples || {};
    const dataOpcao = simples.data_opcao;
    const dataExclusao = simples.data_exclusao;
    const optante = dataOpcao && !dataExclusao;

    document.getElementById('simplesNacional').innerHTML =
  `<strong>Optante pelo Simples Nacional:</strong> ${optante ? 'Sim' : 'Não'}`;
    document.getElementById('dataOpcao').innerHTML =
  `<strong>Data de Opção:</strong> ${dataOpcao || 'Não informado'}`;
    document.getElementById('dataExclusao').innerHTML =
  `<strong>Data de Exclusão:</strong> ${dataExclusao || 'Ainda optante'}`;
    document.getElementById('optanteMei').innerHTML =
  `<strong>Optante pelo MEI:</strong> ${simples.mei ? 'Sim' : 'Não'}`;


  } catch (error) {
    alert('Erro ao consultar o CNPJ: ' + error.message);
  }
});
