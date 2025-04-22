import os
import sys
import requests
from langchain_openai import ChatOpenAI  # Verifique se o pacote está instalado corretamente
from langchain_community.tools import Tool
from langchain.agents import initialize_agent, AgentType
from langchain.memory import ConversationBufferMemory
from langchain.tools import tool

# Configurar saída para UTF-8 para evitar erro de UnicodeEncodeError
sys.stdout.reconfigure(encoding='utf-8')

# 🔑 Substitua pela sua API Key do OpenAI
os.environ["OPENAI_API_KEY"] = "SUA_CHAVE_OPENAI"

# ✅ Função para consultar o CNPJ
@tool
def consultar_cnpj(cnpj: str) -> str:
    """
    Consulta informações de uma empresa pelo CNPJ.
    Retorna nome, situação cadastral, data da situação, CNAE principal e secundários.
    """
    url = f"https://receitaws.com.br/v1/cnpj/{cnpj}"
    headers = {"User-Agent": "Mozilla/5.0"}  

    try:
        response = requests.get(url, headers=headers)
        if response.status_code == 200:
            data = response.json()
            if "nome" in data:
                return f"""
                📌 **Nome da Empresa:** {data.get("nome", "Não informado")}
                ✅ **Situação Cadastral:** {data.get("situacao", "Não informado")}
                📅 **Data da Situação:** {data.get("data_situacao", "Não informado")}
                📂 **CNAE Principal:** {data.get('atividade_principal', [{}])[0].get('code', 'Não encontrado')} - {data.get('atividade_principal', [{}])[0].get('text', 'Não encontrado')}
                🏢 **CNAEs Secundários:** {', '.join([f"{a['code']} - {a['text']}" for a in data.get('atividades_secundarias', [])]) if data.get('atividades_secundarias') else 'Nenhum'}
                """
            else:
                return "⚠️ Nenhuma empresa encontrada para esse CNPJ."
        else:
            return f"❌ Erro ao consultar o CNPJ. Status Code: {response.status_code}"
    except Exception as e:
        return f"⚠️ Erro ao buscar informações: {str(e)}"

# 🔧 Configurar ferramenta no LangChain
tools = [consultar_cnpj]

# 🎯 Criar o modelo LLM
try:
    llm = ChatOpenAI(temperature=0)
except ModuleNotFoundError:
    print("❌ Erro: O módulo 'langchain_openai' não foi encontrado. Verifique se está instalado corretamente com 'pip install langchain-openai'.")
    sys.exit(1)

# 🧠 Criar memória de conversação
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# 🤖 Criar e configurar o agente
agent_executor = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    memory=memory,
    verbose=True
)

# ✅ Iniciar interação com o assistente
print("🤖 Assistente de CNPJ iniciado! Digite um CNPJ para consulta ou 'sair' para encerrar.")

while True:
    user_input = input("🔍 Digite um CNPJ: ").strip()
    
    if user_input.lower() == "sair":
        print("👋 Encerrando assistente...")
        break

    resultado = agent_executor.invoke({"input": user_input})
    print(resultado["output"])
