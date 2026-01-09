import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./CodeBlock";

interface CodeExamplesSectionProps {
    agentUrl: string;
    apiKey: string;
    jsonRpcRequest: any;
    curlExample: string;
    fetchExample: string;
}

export function CodeExamplesSection({
    agentUrl,
    apiKey,
    jsonRpcRequest,
    curlExample,
    fetchExample
}: CodeExamplesSectionProps) {
    const pythonExample = `import requests
import json

def test_a2a_agent():
    url = "${agentUrl || "http://localhost:8000/api/v1/a2a/your-agent-id"}"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "${apiKey || "your-api-key"}"
    }
    
    payload = ${JSON.stringify(jsonRpcRequest, null, 2)}
    
    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    print("Agent response:", data)
    
    return data

if __name__ == "__main__":
    test_a2a_agent()`;

    return (
        <Card className="bg-[#282a36] border-[#bd93f9]/20 text-[#f8f8f2] shadow-[4px_4px_0px_0px_rgba(189,147,249,0.2)]">
            <CardHeader>
                <CardTitle className="text-[#bd93f9]">Code Examples</CardTitle>
                <CardDescription className="text-[#f8f8f2]/60">
                    Code snippets ready to use with A2A agents
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="curl">
                    <TabsList className="bg-[#44475a]/50 border-[#44475a] mb-4">
                        <TabsTrigger value="curl" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                            cURL
                        </TabsTrigger>
                        <TabsTrigger value="javascript" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                            JavaScript
                        </TabsTrigger>
                        <TabsTrigger value="python" className="data-[state=active]:bg-[#bd93f9] data-[state=active]:text-black">
                            Python
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="curl" className="relative">
                        <CodeBlock
                            text={curlExample}
                            language="bash"
                        />
                    </TabsContent>

                    <TabsContent value="javascript" className="relative">
                        <CodeBlock
                            text={fetchExample}
                            language="javascript"
                        />
                    </TabsContent>

                    <TabsContent value="python" className="relative">
                        <CodeBlock
                            text={pythonExample}
                            language="python"
                        />
                    </TabsContent>
                </Tabs>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-[#f8f8f2] mb-3">Sending files to the agent</h3>
                    <p className="text-[#f8f8f2]/60 mb-4">
                        You can attach files to messages sent to the agent using the A2A protocol.
                        The files are encoded in base64 and incorporated into the message as parts of type &quot;file&quot;.
                    </p>

                    <div className="space-y-6">
                        <div>
                            <h4 className="text-lg font-medium text-[#50fa7b] mb-2">Python</h4>
                            <CodeBlock
                                text={`import asyncio
import base64
import os
from uuid import uuid4

from common.client import A2ACardResolver, A2AClient

async def send_message_with_files():
    # Instantiate client
    card_resolver = A2ACardResolver("http://localhost:8000/api/v1/a2a/your-agent-id")
    card = card_resolver.get_agent_card()
    client = A2AClient(agent_card=card)
    
    # Create session and task IDs
    session_id = uuid4().hex
    task_id = uuid4().hex
    
    # Read file and encode in base64
    file_path = "example.jpg"
    with open(file_path, 'rb') as f:
        file_content = base64.b64encode(f.read()).decode('utf-8')
        file_name = os.path.basename(file_path)
    
    # Create message with text and file
    message = {
        'role': 'user',
        'parts': [
            {
                'type': 'text',
                'text': 'Analyze this image for me',
            },
            {
                'type': 'file',
                'file': {
                    'name': file_name,
                    'bytes': file_content,
                    'mime_type': 'application/octet-stream'  # Important: include the mime_type for correct file processing
                },
            }
        ],
    }
    
    # Create request payload
    payload = {
        'id': task_id,
        'sessionId': session_id,
        'acceptedOutputModes': ['text'],
        'message': message,
    }
    
    # Send request
    task_result = await client.send_task(payload)
    print(f'\\nResponse: {task_result.model_dump_json(exclude_none=True)}')

if __name__ == '__main__':
    asyncio.run(send_message_with_files())`}
                                language="python"
                            />
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-[#50fa7b] mb-2">JavaScript/TypeScript</h4>
                            <CodeBlock
                                text={`// Function to convert file to base64
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function sendMessageWithFiles() {
  // Select file (in a web application)
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;
  
  if (files.length === 0) {
    console.error('No file selected');
    return;
  }
  
  // Convert file to base64
  const file = files[0];
  const base64Data = await fileToBase64(file);
  
  // Create session and task IDs
  const sessionId = crypto.randomUUID();
  const taskId = crypto.randomUUID();
  const callId = crypto.randomUUID();
  
  // Create message with text and file
  const payload = {
    jsonrpc: "2.0",
    method: "message/send",
    params: {
      message: {
        role: "user",
        parts: [
          {
            type: "text",
            text: "Analyze this document for me",
          },
          {
            type: "file",
            file: {
              name: file.name,
              bytes: base64Data,
              mime_type: file.type
            }
          }
        ],
      },
      sessionId: sessionId,
      id: taskId,
    },
    id: callId,
  };
  
  // Send request
  const response = await fetch('http://localhost:8000/api/v1/a2a/your-agent-id', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': 'your-api-key',
    },
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  console.log('Agent response:', data);
}`}
                                language="javascript"
                            />
                        </div>

                        <div>
                            <h4 className="text-lg font-medium text-[#50fa7b] mb-2">Curl</h4>
                            <CodeBlock
                                text={`# Convert file to base64
FILE_PATH="example.jpg"
FILE_NAME=$(basename $FILE_PATH)
BASE64_CONTENT=$(base64 -w 0 $FILE_PATH)

# Create request payload
read -r -d '' PAYLOAD << EOM
{
  "jsonrpc": "2.0",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Analyze this image for me"
        },
        {
          "type": "file",
          "file": {
            "name": "$FILE_NAME",
            "bytes": "$BASE64_CONTENT",
            "mime_type": "$(file --mime-type -b $FILE_PATH)"
          }
        }
      ]
    },
    "sessionId": "session-123",
    "id": "task-456"
  },
  "id": "call-789"
}
EOM

# Send request
curl -X POST \\
  http://localhost:8000/api/v1/a2a/your-agent-id \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: your-api-key' \\
  -d "$PAYLOAD"`}
                                language="bash"
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
