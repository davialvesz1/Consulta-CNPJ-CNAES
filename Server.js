const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = 3000;

// Serve arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para consultar o CNPJ
app.get('/consultar-cnpj/:cnpj', async (req, res) => {
  const cnpj = req.params.cnpj;
  const url = `https://receitaws.com.br/v1/cnpj/${cnpj}`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();

      // Retornando apenas os dados necessários, ou tudo
      res.json({
        nome: data.nome,
        situacao: data.situacao,
        data_situacao: data.data_situacao,
        uf: data.uf,
        municipio: data.municipio,
        atividade_principal: data.atividade_principal,
        atividades_secundarias: data.atividades_secundarias,
        simples: data.simples,  // pode conter optante e data de opção
        mensagem: data.mensagem || null  // se houver erro mesmo com 200
      });
    } else {
      const errorData = await response.text();
      console.error('Erro na requisição:', errorData);
      res.status(400).json({ error: 'Erro ao consultar CNPJ', details: errorData });
    }
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ error: 'Erro no servidor', details: error.message });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
