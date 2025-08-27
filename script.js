const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const aiResponse = document.getElementById("aiResponse");
const form = document.getElementById("form");

const markdownToHTML = (text) => {
  const converter = new showdown.Converter();
  return converter.makeHtml(text);
};

const perguntarIA = async (question, game, apiKey) => {
  const model = "gemini-2.0-flash";
  const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const perguntalol = `
  ## Especialidade
  Você é um especialista assistente de meta para o jogo  ${game}

  ## Tarefa
  Você deve responder às perguntas do usuário com base no seu
  conhecimento do jogo, estratégias, build e dicas

  ## Regras
  - Se você não sabe a resposta, responda com 'Não sei' e não
  tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo, responda com
  'Essa pergunta não está relacionada ao jogo."
  - Considere a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual, baseado na
  data atual, para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que
  existe no patch atual.

  ## Resposta
  - Economize na resposta, seja direto e responda no máximo 500
  caracteres.
  - Responda em markdown.
  - Não precisa fazer nenhuma saudação ou despedida, apenas 
  responda o que o usuário está querendo.

  ## Exemplo de resposta
  pergunta do usuário: Melhor build rengar jungle
  resposta: A build mais atual é: \n\n **Itens:**\n\n coloque
  os itens aqui. \n\n**Runas**\n\n exemplo de runas \n\n

  ---

  Aqui está a pergunta do usuário: ${question}
  `;

  const perguntaBrawlStars = `
  ## Especialidade
  Você é um especialista em Brawl Stars, focado no meta atual de cada modo de jogo.
  
  ## Tarefa
  Você deve responder as perguntas do usuário com base no seu
  conhecimento do jogo, estratégias atuais, build, modos, equipamentos e dicas
  
  ## Regras
  - Se não souber a resposta, diga "Não sei".
  - Se a pergunta não for sobre o jogo, diga "Essa pergunta não está relacionada ao jogo."
  - Considere o patch atual (${new Date().toLocaleDateString()}).
  - Responda em até 500 caracteres, usando markdown.
  
  ## Exemplo
  **Pergunta:** Melhor brawler para Pique-Gema  
  **Resposta:**  
  **Brawler:** Bonnie  
  **Acessório:** Canhão Portátil  
  **Estelar:** Chamas Recuperadoras
  
---

**Pergunta do usuário:** ${question}
  `;

  const perguntaClash = `
  ## Especialidade
  Você é um especialista em Clash Royale, focado no meta atual de cada modo de jogo.
  
  ## Tarefa
  Você deve responder as perguntas do usuário com base no seu
  conhecimento do jogo, estratégias atuais, build.

  ## Regras
  - Se você não sabe a resposta, responda com 'Não sei' e não
  tente inventar uma resposta.
  - Se a pergunta não está relacionada ao jogo, responda com
  'Essa pergunta não está relacionada ao jogo."
  - Considere a data atual ${new Date().toLocaleDateString()}
  - Faça pesquisas atualizadas sobre o patch atual, baseado na
  data atual, para dar uma resposta coerente.
  - Nunca responda itens que você não tenha certeza de que
  existe no patch atual.
  
  ## Exemplo de resposta
  **Pergunta do usuário:** Melhor deck de mega cavaleiro de baixo custo de elixir.
  resposta: A build mais atual é: \n\n
  **Custo de Elixir:**\n\n coloque o custo aqui\n\n
  **Cartas:**\n\n coloque as itens aqui.\n\n
  **Combo:**\n\n exemplo de combo.\n\n
  
  ---
  
  **Pergunta do usuário:** ${question}
  `;

  let pergunta;

  if (game == "lol") {
    pergunta = perguntalol;
  } else if (game == "brawlstars") {
    pergunta = perguntaBrawlStars;
  } else if (game == "clashroyale") {
    pergunta = perguntaClash;
  }

  const contents = [
    {
      role: "user", // Config do Agente
      parts: [
        {
          text: pergunta,
        },
      ],
    },
  ];

  const tools = [
    {
      google_search: {},
    },
  ];

  //chamada API
  const response = await fetch(geminiURL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents,
      tools, // Usando um Agente
    }),
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor, preencha todos os campos");
    return;
  }
  askButton.disabled = true;
  askButton.textContent = "Perguntando...";
  askButton.classList.add("loading");

  try {
    // Perguntar para a IA
    const text = await perguntarIA(question, game, apiKey);
    aiResponse.querySelector(".response-content").innerHTML =
      markdownToHTML(text); // Retorno das respostas
    aiResponse.classList.remove("hidden");
  } catch (erro) {
    console.log("Erro: ", erro);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }
};

form.addEventListener("submit", enviarFormulario);