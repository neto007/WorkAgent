import os
import re

def remove_headers(directory):
    # Regex para encontrar o bloco de comentário específico
    header_pattern = re.compile(r'"""\s*┌─+┐\s*│ @author: Davidson Gomes.*?└─+┘\s*"""', re.DOTALL)
    
    count = 0
    for root, dirs, files in os.walk(directory):
        if ".venv" in root or "node_modules" in root or ".git" in root or "__pycache__" in root:
            continue
            
        for file in files:
            if file.endswith(".py"):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    if "@author: Davidson Gomes" in content:
                        new_content = header_pattern.sub('', content).lstrip()
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Limpando: {path}")
                        count += 1
                except Exception as e:
                    print(f"Erro ao processar {path}: {e}")
    return count

if __name__ == "__main__":
    total = 0
    total += remove_headers("/home/machine/repository/evo-ai")
    total += remove_headers("/home/machine/repository/ContextWorks")
    print(f"\nTotal de arquivos limpos: {total}")
