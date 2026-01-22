import React, { useState } from 'react';
import { Code, Wifi, Check, Copy } from 'lucide-react';

interface CodeExamplesProps {
  chatEndpoint: string;
  protectedToken: string;
  wsBaseUrl: string;
  serviceId: string;
}

const CodeBlock = ({ 
  title, 
  code, 
  languageId 
}: { 
  title: string; 
  code: string; 
  languageId: string; 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Copiado</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 text-sm overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const CodeExamples: React.FC<CodeExamplesProps> = ({ 
  chatEndpoint, 
  protectedToken, 
  wsBaseUrl, 
  serviceId 
}) => {
  const token = protectedToken || 'YOUR_PROTECTED_TOKEN';

  const curlExample = `curl -X POST "${chatEndpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "message": "Hola, ¿cómo estás?",
    "threadId": "optional-thread-id"
  }'`;

  const jsExample = `// Usando fetch
const response = await fetch('${chatEndpoint}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}'
  },
  body: JSON.stringify({
    message: 'Hola, ¿cómo estás?',
    threadId: 'optional-thread-id'
  })
});

const data = await response.json();
console.log(data);`;

  const pythonExample = `import requests

url = '${chatEndpoint}'
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${token}'
}
data = {
    'message': 'Hola, ¿cómo estás?',
    'threadId': 'optional-thread-id'
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result)`;

  const wsJsExample = `// Conexión WebSocket con Socket.IO (JavaScript)
import { io } from 'socket.io-client';

const socket = io('${wsBaseUrl}', {
  query: {
    serviceId: '${serviceId}',
    token: '${token}'
  }
});

socket.on('connect', () => {
  console.log('Conectado al WebSocket:', socket.id);
});

socket.on('assistant_response', (data) => {
  console.log('Respuesta del asistente:', data);
});

function sendMessage(message) {
  socket.emit('user_message', { message });
}`;

  const wsPyExample = `# Conexión WebSocket con python-socketio
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print('Conectado al WebSocket')

@sio.event
def assistant_response(data):
    print('Respuesta del asistente:', data)

sio.connect('${wsBaseUrl}', 
           query={'serviceId': '${serviceId}', 
                  'token': '${token}'})

sio.emit('user_message', {'message': 'Hola'})
sio.wait()`;

  return (
    <>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Code className="w-5 h-5 mr-2" />
          Ejemplos de Código (REST)
        </h3>
        <div className="space-y-6">
          <CodeBlock title="cURL" code={curlExample} languageId="bash" />
          <CodeBlock title="JavaScript" code={jsExample} languageId="javascript" />
          <CodeBlock title="Python" code={pythonExample} languageId="python" />
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Wifi className="w-5 h-5 mr-2" />
          Ejemplos de Conexión WebSocket
        </h3>
        <div className="space-y-6">
          <CodeBlock title="JavaScript/TypeScript" code={wsJsExample} languageId="javascript" />
          <CodeBlock title="Python" code={wsPyExample} languageId="python" />
        </div>
      </div>
    </>
  );
};

export default CodeExamples;