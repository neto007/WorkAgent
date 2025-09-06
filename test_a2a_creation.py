#!/usr/bin/env python3

import requests
import json
import uuid
import jwt
from datetime import datetime

# Configuração da API
API_BASE = "http://localhost:8000/api/v1"
CLIENT_ID = "8706be68-1031-4eb7-9406-efb4302acf80"  # ID do cliente existente

def get_jwt_token():
    """Tenta fazer login e obter um token JWT válido"""
    # Dados de login - usuários existentes no sistema
    login_options = [
        {"email": "demo@example.com", "password": "demo123"},  # Usuário demo
        {"email": "admin@evoai.com", "password": "admin123"}   # Admin (se soubermos a senha)
    ]
    
    for login_data in login_options:
        print(f"Tentando login com: {login_data['email']}")
        
        try:
            response = requests.post(
                f"{API_BASE}/auth/login",
                headers={"Content-Type": "application/json"},
                json=login_data
            )
            
            if response.status_code == 200:
                token_data = response.json()
                token = token_data.get("access_token")
                if token:
                    print(f"Login bem-sucedido com {login_data['email']}")
                    return token
            else:
                print(f"Erro no login com {login_data['email']}: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Erro ao fazer login com {login_data['email']}: {e}")
    
    print("Nenhuma credencial funcionou")
    return None

def decode_jwt_token(token):
    """Decodifica o JWT token para obter informações do usuário"""
    try:
        # Decodifica sem verificar a assinatura para fins de teste
        payload = jwt.decode(token, options={"verify_signature": False})
        print(f"Token payload: {json.dumps(payload, indent=2)}")
        return payload
    except Exception as e:
        print(f"Erro ao decodificar token: {e}")
        return None

def test_agent_creation_with_token(token):
    """Testa a criação do agente A2A com token JWT"""
    # Decodifica o token para obter o client_id correto
    payload = decode_jwt_token(token)
    if not payload:
        print("Erro: Não foi possível decodificar o token")
        return
    
    client_id = payload.get('client_id')
    if not client_id:
        print("Erro: client_id não encontrado no token")
        return
    
    print(f"Usando client_id do token: {client_id}")
    
    headers = {
        "Content-Type": "application/json",
        "x-client-id": client_id,
        "Authorization": f"Bearer {token}"
    }
    
    # Primeiro, vamos tentar criar um agente LLM para testar se a criação funciona
    llm_agent_data = {
        "name": "test-llm-agent",
        "description": "Agente LLM de teste",
        "type": "llm",
        "model": "gpt-3.5-turbo",  # Modelo obrigatório para LLM
        "client_id": client_id,
        "config": {
            "api_key": "test-api-key-123"  # API key obrigatória para LLM
        }
    }
    
    print("\n=== Testando criação de agente LLM primeiro ===")
    print(f"Dados: {json.dumps(llm_agent_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_BASE}/agents/",
            headers=headers,
            json=llm_agent_data
        )
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            created_agent = response.json()
            print(f"✅ Agente LLM criado com sucesso! ID: {created_agent.get('id')}")
            
            # Agora vamos tentar criar um agente A2A usando o ID do agente criado
            agent_id = created_agent.get('id')
            agent_data = {
                "name": "test-a2a-agent",
                "description": "Agente A2A de teste",
                "type": "a2a",
                "agent_card_url": f"http://localhost:8000/api/v1/a2a/{agent_id}/.well-known/agent.json",
                "client_id": client_id,
                "config": {}
            }
        else:
            print("❌ Falha na criação do agente normal, tentando A2A mesmo assim...")
            # Dados do agente A2A original
            agent_data = {
                "name": "test-a2a-agent",
                "description": "Agente A2A de teste",
                "type": "a2a",
                "agent_card_url": f"http://localhost:8000/api/v1/a2a/{client_id}/.well-known/agent.json",
                "client_id": client_id,
                "config": {}
            }
    except Exception as e:
        print(f"Erro ao criar agente normal: {e}")
        # Dados do agente A2A original
        agent_data = {
            "name": "test-a2a-agent",
            "description": "Agente A2A de teste",
            "type": "a2a",
            "agent_card_url": f"http://localhost:8000/api/v1/a2a/{client_id}/.well-known/agent.json",
            "client_id": client_id,
            "config": {}
        }
    
    print("\n=== Testando criação de agente A2A ===")
    
    print("Tentando criar agente A2A com token JWT...")
    print(f"Dados: {json.dumps(agent_data, indent=2)}")
    
    try:
        response = requests.post(
            f"{API_BASE}/agents/",
            headers=headers,
            json=agent_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 422:
            print("\nDetalhes do erro de validação:")
            error_data = response.json()
            print(json.dumps(error_data, indent=2))
        elif response.status_code == 201:
            created_a2a_agent = response.json()
            a2a_agent_id = created_a2a_agent.get('id')
            print(f"\n✅ Agente A2A criado com sucesso! ID: {a2a_agent_id}")
            return a2a_agent_id
            
    except Exception as e:
        print(f"Erro na requisição: {e}")
    
    return None

def test_different_variations(existing_a2a_agent_id=None):
    """Testa diferentes variações de dados para identificar o problema"""
    token = get_jwt_token()
    if not token:
        print("Não foi possível obter token JWT. Verifique as credenciais.")
        return
    
    # Decodifica o token para obter o client_id correto
    payload = decode_jwt_token(token)
    if not payload:
        print("Erro: Não foi possível decodificar o token")
        return
    
    client_id = payload.get('client_id')
    if not client_id:
        print("Erro: client_id não encontrado no token")
        return
    
    headers = {
        "Content-Type": "application/json",
        "x-client-id": client_id,
        "Authorization": f"Bearer {token}"
    }
    
    # Use o ID do agente A2A existente se fornecido, senão use o client_id
    agent_id_for_url = existing_a2a_agent_id if existing_a2a_agent_id else client_id
    
    # Teste 1: Dados mínimos obrigatórios
    print("\n" + "="*50)
    print("Teste 1: Dados mínimos para A2A")
    agent_data_minimal = {
        "type": "a2a",
        "agent_card_url": f"http://localhost:8000/api/v1/a2a/{agent_id_for_url}/.well-known/agent.json",
        "client_id": client_id
    }
    
    try:
        response = requests.post(f"{API_BASE}/agents/", headers=headers, json=agent_data_minimal)
        print(f"Status: {response.status_code}")
        if response.status_code == 422:
            error_data = response.json()
            print(f"Erro: {json.dumps(error_data, indent=2)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Erro: {e}")
    
    # Teste 2: Com nome válido
    print("\n" + "="*50)
    print("Teste 2: Com nome válido (sem espaços/caracteres especiais)")
    agent_data_with_name = {
        "name": "test-a2a-agent-2",
        "type": "a2a",
        "agent_card_url": f"http://localhost:8000/api/v1/a2a/{agent_id_for_url}/.well-known/agent.json",
        "client_id": client_id
    }
    
    try:
        response = requests.post(f"{API_BASE}/agents/", headers=headers, json=agent_data_with_name)
        print(f"Status: {response.status_code}")
        if response.status_code == 422:
            error_data = response.json()
            print(f"Erro: {json.dumps(error_data, indent=2)}")
        else:
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Erro: {e}")

if __name__ == "__main__":
    print("=== Teste de Criação de Agente A2A ===")
    
    # Primeiro, tenta obter um token JWT
    token = get_jwt_token()
    
    if token:
        print(f"Token JWT obtido com sucesso: {token[:50]}...")
        a2a_agent_id = test_agent_creation_with_token(token)
        test_different_variations(a2a_agent_id)
    else:
        print("Não foi possível obter token JWT. Testando diferentes variações...")
        test_different_variations()