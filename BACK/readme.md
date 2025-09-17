Posture Analysis API

This project contains a Python script and a FastAPI backend to analyze running posture from video files.

🔹 Requisitos

Python 3.10+

pip ou conda

ffmpeg (opcional, se quiser processar vídeos em formatos diferentes de MP4)

🔹 Instalação do ambiente

Recomendo usar conda para gerenciar o ambiente:

# Criar ambiente
conda create -n mediapipe-env python=3.10 -y

# Ativar ambiente
conda activate mediapipe-env

# Instalar dependências
pip install fastapi uvicorn python-multipart opencv-python mediapipe numpy


Caso queira usar venv, crie o ambiente com python -m venv venv e ative com source venv/bin/activate (Linux/macOS) ou venv\Scripts\activate (Windows).

🔹 Rodando a API

Entre na pasta do backend:

cd BACK


Execute a API com Uvicorn:

uvicorn root:app --reload


A API estará disponível em:

http://127.0.0.1:8000


Teste o endpoint /analisar-video/ enviando um vídeo via POST.

Você pode usar o Swagger:

http://127.0.0.1:8000/docs

🔹 Rodando o script Python isolado

Coloque o vídeo que deseja analisar na mesma pasta do script ou informe o caminho correto:

cap = cv2.VideoCapture('run.mp4')


Execute o script:

python analyze_posture.py


O script vai:

Detectar postures frame a frame

Imprimir no console quando a postura estiver incorreta

Armazenar os dados em um array para futuras análises ou envio para a API

🔹 Configurações importantes

CORS: Se você estiver chamando a API de um frontend React (localhost:5173), certifique-se que o middleware CORS está configurado no root.py:

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Campo do arquivo: O endpoint /analisar-video/ espera que o arquivo seja enviado com o nome file no FormData.

🔹 Estrutura do projeto
project/
│
├── BACK/                 # API FastAPI
│   ├── root.py
│   └── ...
│
├── scripts/              # Scripts Python
│   └── analyze_posture.py
│
└── FRONT/                # React frontend
    └── ...

🔹 Observações

O script Python e a API usam MediaPipe Pose para detectar landmarks do corpo.

O tempo total errado e o percentual errado podem ser calculados automaticamente pelo script ou pela API.

Certifique-se que o vídeo esteja em MP4 ou um formato suportado pelo OpenCV.