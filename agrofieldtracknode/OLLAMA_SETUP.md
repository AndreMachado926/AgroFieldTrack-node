# 🤖 Integração Ollama + Llava

Guia de configuração para integrar o Ollama com Llava no seu backend Node.js.

## 📋 Pré-requisitos

1. **Ollama instalado** - [Download aqui](https://ollama.ai)
2. **Modelo Llava** - Para usar o Llava, execute:
   ```bash
   ollama pull llava
   ```
3. **Node.js** - v14 ou superior

## 🚀 Setup do Backend

### 1. Instalar dependência (axios já está instalado)

Se `axios` não estiver na lista de dependências:
```bash
npm install axios
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` e renomeie para `.env`:
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
OLLAMA_API=http://localhost:11434
OLLAMA_MODEL=llava
```

### 3. Iniciar o Ollama

Em um terminal separado, execute:
```bash
ollama serve
```

Você deve ver:
```
Listening on 127.0.0.1:11434
```

### 4. Iniciar o backend

Na pasta `node/agrofieldtracknode/`:
```bash
npm run dev
```

## 📡 Endpoints da API

### 1. Enviar mensagem para a IA
**POST** `/ai/chat`

```bash
curl -X POST http://localhost:5000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Qual é a melhor forma de cuidar de um cavalo?",
    "conversationHistory": [
      { "sender": "user", "text": "Olá" },
      { "sender": "agent", "text": "Olá! Como posso ajudar?" }
    ]
  }'
```

**Resposta:**
```json
{
  "success": true,
  "response": "A melhor forma de cuidar de um cavalo inclui...",
  "timestamp": "2026-04-21T10:30:00.000Z"
}
```

### 2. Verificar status da IA
**GET** `/ai/status`

```bash
curl http://localhost:5000/ai/status
```

**Resposta:**
```json
{
  "success": true,
  "status": {
    "ollamaAvailable": true,
    "serviceRunning": true,
    "models": [
      {
        "name": "llava:latest",
        "size": 4700000000,
        "modifiedAt": "2026-04-21T10:00:00Z"
      }
    ],
    "defaultModel": "llava"
  }
}
```

### 3. Obter lista de modelos
**GET** `/ai/models`

```bash
curl http://localhost:5000/ai/models
```

**Resposta:**
```json
{
  "success": true,
  "models": [
    {
      "name": "llava:latest",
      "size": 4700000000,
      "modifiedAt": "2026-04-21T10:00:00Z"
    }
  ]
}
```

## 🔧 Troubleshooting

### Erro: "Não consegui conectar ao Ollama"

**Solução:**
1. Verifique se o Ollama está rodando: `ollama serve`
2. Teste a conexão:
   ```bash
   curl http://localhost:11434/api/tags
   ```
3. Verifique a porta em `.env`

### Erro: "Modelo llava não encontrado"

**Solução:**
```bash
# Puxar o modelo
ollama pull llava

# Listar modelos disponíveis
ollama list
```

### Timeout ao enviar mensagem

**Solução:**
- Aumente o timeout em `aiservice.js` (atualmente 120 segundos)
- O Llava é pesado, primeira resposta pode levar mais tempo
- Verifique recursos do sistema (CPU, RAM)

## 📱 Frontend - Adicionar rota

No `App.tsx`, adicione:

```tsx
import AgentChatPage from "./pages/agent_helper/agent_chat";

// ...

<Route exact path="/agent" component={AgentChatPage} />
```

## 🎯 Fluxo da Aplicação

```
Frontend (agent_chat.tsx)
    ↓
POST /ai/chat
    ↓
Backend (AiController.js)
    ↓
AI Service (aiservice.js)
    ↓
Ollama API (localhost:11434)
    ↓
Modelo Llava
    ↓
Resposta
```

## 🧠 Otimizações

### 1. Manter contexto da conversa
O frontend envia `conversationHistory` para manter contexto:
```js
const conversationHistory = messages.map(m => ({
  sender: m.sender,
  text: m.text
}));
```

### 2. Ajustar temperatura (criatividade)
Em `aiservice.js`:
```js
temperature: 0.7,  // 0-1: mais baixo = mais determinístico
top_p: 0.9,        // 0-1: nucleus sampling
top_k: 40          // Top K filtering
```

### 3. Aumentar contexto
```js
context_window: 2048  // Aumentar para mais histórico
```

## 📚 Modelos alternativos

Você pode usar outros modelos do Ollama:

```bash
# Mais rápido e leve
ollama pull neural-chat

# Melhor qualidade, mais pesado
ollama pull llama2

# Modelo pequeno
ollama pull orca-mini
```

Editar em `.env`:
```env
OLLAMA_MODEL=neural-chat
```

## ✅ Testes

### Teste local (sem frontend)

```bash
# Terminal 1: Iniciar Ollama
ollama serve

# Terminal 2: Iniciar backend
npm run dev

# Terminal 3: Testar API
curl -X POST http://localhost:5000/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Olá, como vai?"}'
```

## 🔐 Notas de Segurança

1. **Não expor Ollama na internet** - Use apenas localhost
2. **Rate limiting** - Considere adicionar no futuro
3. **Validação de entrada** - O backend valida mensagens vazias
4. **Logs** - Verificar `/logs` para debug

---

**Pronto!** Seu agente de IA está funcionando com Ollama + Llava! 🎉
