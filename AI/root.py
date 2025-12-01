# ====================== IMPORT DAS BIBLIOTECAS ======================
import os
import shutil
import cv2
import numpy as np
from multiprocessing import Pool, cpu_count
import tempfile
import json
from datetime import datetime
from typing import Dict, List, Any
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

#desabilita threads internas 
try:
    cv2.setNumThreads(0)
except Exception:
    pass

import mediapipe as mp

# atalhos para facilitar leitura do código
mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

# ======================= TO DO =======================
#TO DO: definir se vai desenhar algo no frame
#TO DO: JSON para o front
#TO DO: escrever infos no back
#TO DO: se o angulo for negativo, ignorar angulo
 
# ======================= VARIÁVEIS GLOBAIS =======================
VIDEO_PATH = 'runsakai.mp4'         # caminho do vídeo 

# Pastas e formatos de I/O
FRAMES_DIR = 'frames_raw'           # pasta onde os frames do vídeo serão salvos
FRAMES_EXT = '.jpg'                 # formato dos frames extraídos: '.jpg' 
FRAMES_JPEG_QUALITY = 92            # qualidade JPEG dos frames extraídos (0-100)

OUT_DIR = 'out'                     # pasta raiz de saída 
IMG_EXT = '.jpg'                    # extensão das imagens salvas nas pastas de saída
JPEG_QUALITY = 92                   # qualidade JPEG para as saídas anotadas

# Flags de salvamento (controlam o que será escrito em disco)
SAVE_ALL_FRAMES = False             # True: salva TODOS os frames anotados (alto custo de I/O)
SAVE_LOW_VIS_FRAMES = True          # True: salva frames com visibilidade insuficiente

# ============== VARIÁVEIS DO MEDIAPIPE ====================
MODEL_COMPLEXITY = 1                # 0|1|2 — 1 equilibrio entre custo e qualidade
MIN_DET_CONF = 0.5                  # confiança mínima de detecção 
MIN_TRK_CONF = 0.5                  # confiança mínima de tracking 

# Lógica de análise
MIN_VIS = 0.30                      # visibilidade mínima de um landmark para ser considerado confiável
BACK_ANGLE_BAD_THRESH = 110.0       # threshold para angulo das costas
WINDOW_SECONDS = 0.8                # janela de segundos para captura do overstride
COOLDOWN_SECONDS = 0.2             # tempo mínimo entre detecções consecutivas do calcanhar, evitar pegar o pe no meio da esteira

# PONTO DE CONTATO DO CALCANHAR: 2/8 DO PÉ
CONTACT_RATIO = 2.0 / 8.0           # define o ponto de contato calcanhar com a esteira, sem pegar a ponta do pé pelo mediapipe

# Paralelismo
MULTIPROCESS = True                 # True: processa em chunks com multiprocessing (ideal para videos maiores de 30 segundos) / False: assiste o video em tempo real
NUM_PROCS = max(4, cpu_count() - 1) # número de processos/workers | aqui preferimos usar (N-1) ou 4, o que for maior
CHUNK_SIZE_FRAMES = 200             # quantidade (aprox.) de frames por chunk no multiprocess
# ===========================================================


# ------------------ UTIL ------------------
def reset_out_dir():
    """
    Apaga e recria a pasta de saída OUT_DIR para garantir um ambiente limpo em cada execução.
    Útil para não misturar resultados de runs anteriores.
    """
    if os.path.isdir(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    os.makedirs(OUT_DIR, exist_ok=True)

def ensure_dirs():
    """
    Cria as subpastas de saída necessárias:
      - postura_incorreta: quando o ângulo das costas é considerado ruim;
      - min_heel: quando detectamos o "mínimo" do calcanhar e desenhamos o overstride;
      - baixa_visibilidade: quando landmarks chave não atingem MIN_VIS;
      - all (opcional): todos os frames anotados (se SAVE_ALL_FRAMES=True).
    """
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, 'postura_incorreta'), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, 'min_heel'), exist_ok=True)
    os.makedirs(os.path.join(OUT_DIR, 'baixa_visibilidade'), exist_ok=True)
    if SAVE_ALL_FRAMES:
        os.makedirs(os.path.join(OUT_DIR, 'all'), exist_ok=True)

def reset_frames_dir():
    """
    Apaga e recria a pasta dos frames extraídos do vídeo. Isso impede confusão entre
    frames antigos e os do vídeo atual.
    """
    if os.path.isdir(FRAMES_DIR):
        shutil.rmtree(FRAMES_DIR)
    os.makedirs(FRAMES_DIR, exist_ok=True)

def save_img(path, img):
    """
    Salva imagem no 'path' respeitando a qualidade JPEG configurada.
    """
    if path.lower().endswith('.jpg'):
        cv2.imwrite(path, img, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    else:
        cv2.imwrite(path, img)

def is_visible(lm, thr=MIN_VIS):
    """
    Verifica se o frame é minimamente visivel.
    """
    return (hasattr(lm, 'visibility') and lm.visibility is not None and lm.visibility > thr)

def frame_path(idx):
    """
    Cria a indexacao dos frames na pasta.
    """
    return os.path.join(FRAMES_DIR, f"frame_{idx:06d}{FRAMES_EXT}")

def annotated_path(subdir, idx):
    """
    Constrói o caminho onde será salvo um frame anotado, organizado por subpasta temática:
      OUT_DIR/<subdir>/frame_000000.jpg
    """
    return os.path.join(OUT_DIR, subdir, f"frame_{idx:06d}{IMG_EXT}")

def to_pixel(pt_norm, w, h):
    """
    Converte um ponto normalizado (x,y em [0,1]) do MediaPipe para coordenadas em pixels.
    Ou seja, garante que videos de resolucoes de diferentes sejam compativeis com o mesmo codigo, ja que converte para pixels
    """
    x = float(np.clip(getattr(pt_norm, 'x', np.nan), 0.0, 1.0))
    y = float(np.clip(getattr(pt_norm, 'y', np.nan), 0.0, 1.0))
    if not np.isfinite(x): x = 0.0
    if not np.isfinite(y): y = 0.0
    return np.array([x * w, y * h], dtype=float)


# ------------------ FASE 1: EXTRAIR FRAMES ------------------
def extract_frames(video_path=VIDEO_PATH):
    """
    1) Transforma o vídeo em frames:
       - Salva arquivos na pasta FRAMES_DIR
       - Lê FPS; se não vier válido do contêiner, usa 30.0 como fallback.
       - Retorna meta: {"fps": float, "frame_count": int, "frames_ext": str}
    """
    reset_frames_dir()  # garante pasta limpa

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        # nao achou o arquivbo
        raise RuntimeError(f"[ERRO] Não foi possível abrir: {video_path}")

    # Tenta obter FPS. Se o contêiner de vídeo não reporta, força 30.0
    fps = cap.get(cv2.CAP_PROP_FPS)
    try:
        fps = float(fps)
        if not np.isfinite(fps) or fps <= 0:
            fps = 30.0
    except Exception:
        fps = 30.0

    frame_count_reported = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) if cap.get(cv2.CAP_PROP_FRAME_COUNT) else 0
    print(f"[EXTRACT] FPS={fps:.3f} | frames informados={frame_count_reported} ")

    # Loop de leitura frame a frame do video
    i = 0
    while True:
        ret, frame = cap.read()   # ret=False quando acaba o vídeo ou ocorre falha de leitura
        if not ret:
            break

        out_path = frame_path(i)
        if FRAMES_EXT == '.jpg':
            cv2.imwrite(out_path, frame, [cv2.IMWRITE_JPEG_QUALITY, FRAMES_JPEG_QUALITY])
        else:
            cv2.imwrite(out_path, frame)

        i += 1
        if (i % 300) == 0: #extrair frames em batches
            print(f"[EXTRACT] {i} frames extraídos...")

    cap.release()
    print(f"[EXTRACT] Concluído. {i} frames salvos em: {FRAMES_DIR}")

    return {"fps": fps, "frame_count": i, "frames_ext": FRAMES_EXT}


# ------------------ LÓGICA DE ÂNGULO DAS COSTAS ------------------
def calculate_back_posture(a, b, c):
    """
    Calcula o ângulo entre
    a: ombro direito
    b: quadril direito
    c: joelho direito
    - Usa atan2 para obter ângulo orientado e normaliza o resultado para [0, 180].
    """
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
    angle = np.abs(np.degrees(radians))
    if angle > 180.0:
        angle = 360 - angle
    return float(angle)


# ------------------ FASE 2: PROCESSAR (SEQUENCIAL/VIDEOS CURTOS) ------------------ 
def process_frames_sequential(meta):
    """
    2) Analisa frames em ordem (single-process), ou seja, roda o video em tempo real, bom até 20 segundos
    3) Salva frames em subpastas conforme a análise (postura ruim, overstride, baixa visibilidade).
    """
    ensure_dirs()  

    fps = meta['fps']
    window_size = max(1, int(round(fps * WINDOW_SECONDS)))        # janela em num de frames
    cooldown_frames = max(1, int(round(fps * COOLDOWN_SECONDS)))  # cooldown em num de frames
    TOL = 1e-3                         # variavel de tolerancia pra evitar problemas com casas decimais
    detection_cooldown = 0             # contador de cooldown (0 = pronto para detectar)
    rightHeel_history = []             # valores historicos de y do calcanhar
    
    # Lists to store frame-level data
    frame_data = {
        'posture_angles': [],      # Store all angles for each frame
        'overstride_frames': [],   # Store overstride detection for each frame
        'success_frames': {
            'posture': [],
            'overstride': []
        }
    }

    # instancia do mediapipe
    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=MODEL_COMPLEXITY,
        smooth_landmarks=True,
        enable_segmentation=False,
        min_detection_confidence=MIN_DET_CONF,
        min_tracking_confidence=MIN_TRK_CONF
    ) as pose:

        i = 0
        while True:
            img_path = frame_path(i)
            if not os.path.exists(img_path):
                break  # fim dos frames

            image = cv2.imread(img_path)
            if image is None:
                i += 1
                continue  # frame corrompido/impossível de ler

            #filtro para o mediapipe
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            results = pose.process(rgb)
            rgb.flags.writeable = True
            image = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

            h, w, _ = image.shape

            back_angle = None
            lowest_heel_y = None
            right_heel_y = None
            visibility_issue = False

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark

                # posicoes dos pontos no frame
                shoulder_idx = mp_pose.PoseLandmark.RIGHT_SHOULDER.value
                hip_idx      = mp_pose.PoseLandmark.RIGHT_HIP.value
                knee_idx     = mp_pose.PoseLandmark.RIGHT_KNEE.value
                heel_idx     = mp_pose.PoseLandmark.RIGHT_HEEL.value
                foot_idx     = mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value

                sh_lm = lm[shoulder_idx]; hip_lm = lm[hip_idx]; knee_lm = lm[knee_idx]
                heel_lm = lm[heel_idx];    fidx_lm = lm[foot_idx]

                # --------- Ângulo das costas (só salva quando ruim) ---------
                if is_visible(sh_lm) and is_visible(hip_lm) and is_visible(knee_lm):
                    shoulder = [sh_lm.x, sh_lm.y]
                    hip      = [hip_lm.x, hip_lm.y]
                    knee     = [knee_lm.x, knee_lm.y]
                    angle = calculate_back_posture(shoulder, hip, knee)
                    back_angle = angle
                    
                    # Store angle for this frame
                    frame_data['posture_angles'].append({
                        'frame_number': i,
                        'angle': round(angle, 2)
                    })

                    if angle <= BACK_ANGLE_BAD_THRESH:
                        # desenha os landmarks em vermelho e salva na pasta 'postura_incorreta'
                        mp_drawing.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                        )
                        print(f"[POSTURA] frame={i} angle={angle:.1f}° (ruim)")
                        save_img(annotated_path('postura_incorreta', i), image)
                    else:
                        # Store as a success frame
                        if len(frame_data['success_frames']['posture']) == 0:
                            # Save first success frame
                            success_dir = os.path.join(OUT_DIR, 'success_frames')
                            os.makedirs(success_dir, exist_ok=True)
                            save_img(os.path.join(success_dir, f'posture_success_{i:06d}.jpg'), image)
                            frame_data['success_frames']['posture'].append(i)
                else:
                    # se algum dos três (ombro/quadril/joelho) está com vis < MIN_VIS, não confiamos no angulo
                    visibility_issue = True

                # --------- ponto mais baixo do calcanhar ---------
                if is_visible(heel_lm) and is_visible(fidx_lm) and is_visible(knee_lm):
                    right_heel_y = float(heel_lm.y)  # altura do pe
                    rightHeel_history.append(right_heel_y) # guardo a altura
                    if len(rightHeel_history) > window_size: # so guarda se ja tiver passado a janela de tempo
                        rightHeel_history.pop(0)  # mantemos apenas a janela

                    if len(rightHeel_history) == window_size:
                        # maior y na janela => calcanhar mais baixo 
                        lowest_heel_y = float(np.max(rightHeel_history))

                        # Dispara no pico e quando cooldown chegou a zero
                        if detection_cooldown == 0 and right_heel_y >= lowest_heel_y - TOL:
                            # converte pontos para pixels
                            heel_px = to_pixel(heel_lm, w, h)
                            fidx_px = to_pixel(fidx_lm, w, h)
                            knee_px = to_pixel(knee_lm,  w, h)

                            # Ponto de contato com o solo: 2/8 do pé (calcanhar)
                            contact_px = heel_px + (fidx_px - heel_px) * CONTACT_RATIO

                            # -------------- CALCULO DO OVERSTRIDE -----------------------
                            vertical = np.array([0.0, -1.0])  # y para cima é negativo em coordenadas de imagem
                            knee_vec = knee_px - contact_px
                            knee_norm = np.linalg.norm(knee_vec)
                            if knee_norm > 1e-6:
                                cos_val = float(np.clip(np.dot(vertical, knee_vec) / knee_norm, -1.0, 1.0))
                                angle_deg = float(np.degrees(np.arccos(cos_val)))
                            else:
                                # para nao dividir nada por 0
                                angle_deg = 0.0
                            
                            # Store overstride data for this frame with angle
                            frame_data['overstride_frames'].append({
                                'frame_number': i,
                                'overstride': angle_deg > 8.0,
                                'angle': round(angle_deg, 2)
                            })
                            
                            # Don't save frames during processing - will save only best/worst in collection phase
                            if angle_deg > 8.0:
                                print(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8) - ERROR")
                            else:
                                print(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8) - SUCCESS")

                            # inicia cooldown para não duplicar detecções do mesmo pico
                            detection_cooldown = cooldown_frames
                        

                # decrementa cooldown ao fim do frame
                if detection_cooldown > 0:
                    detection_cooldown -= 1
            else:
                # nenhum landmark detectado neste frame
                visibility_issue = True

            # Salva frames de baixa visibilidade caso configurado
            if visibility_issue and SAVE_LOW_VIS_FRAMES:
                cv2.putText(image, "VISIBILIDADE DIREITA INSUFICIENTE", (10, h-20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2, cv2.LINE_AA)
                save_img(annotated_path('baixa_visibilidade', i), image)

            # salvar os frames do video
            if SAVE_ALL_FRAMES:
                save_img(annotated_path('all', i), image)

            # debug log do frame
            print(f"[FRAME {i:06d}] back_angle={(f'{back_angle:.2f}°' if back_angle is not None else 'None')} "
                  f"| heel_y={(f'{right_heel_y:.4f}' if right_heel_y is not None else 'None')} "
                  f"| lowest_y={(f'{lowest_heel_y:.4f}' if lowest_heel_y is not None else 'None')}")
            i += 1
    
    # Save frame-level data to JSON file
    frame_data_path = os.path.join(OUT_DIR, 'frame_data.json')
    with open(frame_data_path, 'w') as f:
        json.dump(frame_data, f, indent=2)
    print(f"[DATA] Frame-level data saved to: {frame_data_path}")

    print(f"[OK] Análises salvas em: {os.path.abspath(OUT_DIR)}")


# ------------------ FASE 2: PROCESSAR (MULTIPROCESS=TRUE/VIDEOS LONGOS) ------------------
def split_indices(frame_count, chunk_len, window_size):
    """
    Divide os frames em partes de tamanho = chunk_len.
    Para cada parte, adiciona um prefixo de OVERLAP com (window_size - 1) frames,
    que serve para "aquecer" o histórico local de calcanhar dentro do worker,
    evitando perder o primeiro pico do chunk.

    """
    parts = []
    start = 0
    while start < frame_count:
        end = min(start + chunk_len, frame_count)
        overlap_start = max(0, start - (window_size - 1))
        parts.append((overlap_start, end, start))
        start = end
    return parts

def worker_chunk(args):
    """
    Processa um único chunk em um processo separado.
    - Reconstrói o objeto Pose para este processo.
    - Processa [ini_with_overlap .. end_idx), gerando saída apenas para i >= effective_start
      (antes disso é warm-up para encher a janela de histórico).
    - Mantém seu próprio histórico de calcanhar e cooldown.
    """
    ini_with_overlap, end_idx, effective_start, meta = args

    fps = meta['fps']
    window_size = max(1, int(round(fps * WINDOW_SECONDS)))
    cooldown_frames = max(1, int(round(fps * COOLDOWN_SECONDS)))
    TOL = 1e-3
    detection_cooldown = 0
    rightHeel_history = []

    local_logs = []  # strings de log para retornar ao processo pai (apenas informativo)
    
    # Local frame data for this chunk
    local_frame_data = {
        'posture_angles': [],
        'overstride_frames': [],
        'success_frames': {
            'posture': [],
            'overstride': []
        }
    }

    with mp_pose.Pose(
        static_image_mode=False,
        model_complexity=MODEL_COMPLEXITY,
        smooth_landmarks=True,
        enable_segmentation=False,
        min_detection_confidence=MIN_DET_CONF,
        min_tracking_confidence=MIN_TRK_CONF
    ) as pose:

        for i in range(ini_with_overlap, end_idx):
            path = frame_path(i)
            if not os.path.exists(path):
                continue

            image = cv2.imread(path)
            if image is None:
                continue

            # instancia MediaPipe 
            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            results = pose.process(rgb)
            rgb.flags.writeable = True
            image = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
            h, w, _ = image.shape

            back_angle = None
            lowest_heel_y = None
            right_heel_y = None
            visibility_issue = False

            if results.pose_landmarks:
                lm = results.pose_landmarks.landmark

                shoulder_idx = mp_pose.PoseLandmark.RIGHT_SHOULDER.value
                hip_idx      = mp_pose.PoseLandmark.RIGHT_HIP.value
                knee_idx     = mp_pose.PoseLandmark.RIGHT_KNEE.value
                heel_idx     = mp_pose.PoseLandmark.RIGHT_HEEL.value
                foot_idx     = mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value

                sh_lm = lm[shoulder_idx]; hip_lm = lm[hip_idx]; knee_lm = lm[knee_idx]
                heel_lm = lm[heel_idx];    fidx_lm = lm[foot_idx]

                # --------- Ângulo das costas ---------
                if is_visible(sh_lm) and is_visible(hip_lm) and is_visible(knee_lm):
                    shoulder = [sh_lm.x, sh_lm.y]
                    hip      = [hip_lm.x, hip_lm.y]
                    knee     = [knee_lm.x, knee_lm.y]
                    angle = calculate_back_posture(shoulder, hip, knee)
                    back_angle = angle
                    
                    # Store angle for this frame
                    if i >= effective_start:
                        local_frame_data['posture_angles'].append({
                            'frame_number': i,
                            'angle': round(angle, 2)
                        })

                    if angle <= BACK_ANGLE_BAD_THRESH and i >= effective_start:
                        mp_drawing.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                        )
                        local_logs.append(f"[POSTURA] frame={i} angle={round(angle,1)}° (ruim)")
                        save_img(annotated_path('postura_incorreta', i), image)
                    elif i >= effective_start and len(local_frame_data['success_frames']['posture']) == 0:
                        # Store as a success frame
                        success_dir = os.path.join(OUT_DIR, 'success_frames')
                        os.makedirs(success_dir, exist_ok=True)
                        save_img(os.path.join(success_dir, f'posture_success_{i:06d}.jpg'), image)
                        local_frame_data['success_frames']['posture'].append(i)
                else:
                    visibility_issue = True

                # --------- Janela local do calcanhar (no chunk) ---------
                if is_visible(heel_lm) and is_visible(fidx_lm) and is_visible(knee_lm):
                    right_heel_y = float(heel_lm.y)
                    rightHeel_history.append(right_heel_y)
                    if len(rightHeel_history) > window_size:
                        rightHeel_history.pop(0)

                    if len(rightHeel_history) == window_size:
                        lowest_heel_y = float(np.max(rightHeel_history))
                        if detection_cooldown == 0 and right_heel_y >= lowest_heel_y - TOL:
                            heel_px = to_pixel(heel_lm, w, h)
                            fidx_px = to_pixel(fidx_lm, w, h)
                            knee_px = to_pixel(knee_lm, w, h)

                            # ponto de contato 2/8 entre heel e foot_index
                            contact_px = heel_px + (fidx_px - heel_px) * CONTACT_RATIO

                            vertical = np.array([0.0, -1.0])
                            knee_vec = knee_px - contact_px
                            knee_norm = np.linalg.norm(knee_vec)
                            if knee_norm > 1e-6:
                                cos_val = float(np.clip(np.dot(vertical, knee_vec) / knee_norm, -1.0, 1.0))
                                angle_deg = float(np.degrees(np.arccos(cos_val)))
                            else:
                                angle_deg = 0.0
                            
                            # Store overstride data for this frame with angle
                            if i >= effective_start:
                                local_frame_data['overstride_frames'].append({
                                    'frame_number': i,
                                    'overstride': angle_deg > 8.0,
                                    'angle': round(angle_deg, 2)
                                })

                            # Don't save frames during processing - will save only best/worst in collection phase
                            if i >= effective_start:
                                if angle_deg > 8.0:
                                    local_logs.append(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8) - ERROR")
                                else:
                                    local_logs.append(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8) - SUCCESS")

                            detection_cooldown = cooldown_frames
                        else:
                            # Not a peak overstride frame
                            if i >= effective_start:
                                local_frame_data['overstride_frames'].append({
                                    'frame_number': i,
                                    'overstride': False,
                                    'angle': None
                                })

                if detection_cooldown > 0:
                    detection_cooldown -= 1
            else:
                visibility_issue = True

            # baixa visibilidade (opcional)
            if visibility_issue and i >= effective_start and SAVE_LOW_VIS_FRAMES:
                cv2.putText(image, "VISIBILIDADE DIREITA INSUFICIENTE", (10, h-20),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0,0,255), 2, cv2.LINE_AA)
                save_img(annotated_path('baixa_visibilidade', i), image)

            # opcional: salvar todos os frames
            if SAVE_ALL_FRAMES and i >= effective_start:
                save_img(annotated_path('all', i), image)

            # logs do chunk
            if i >= effective_start:
                local_logs.append(
                    f"[FRAME {i:06d}] back_angle={(f'{back_angle:.2f}°' if back_angle is not None else 'None')} "
                    f"| heel_y={(f'{right_heel_y:.4f}' if right_heel_y is not None else 'None')} "
                    f"| lowest_y={(f'{lowest_heel_y:.4f}' if lowest_heel_y is not None else 'None')}"
                )

    # devolve as linhas de log e os dados do frame para o processo pai
    return {
        'logs': "\n".join(local_logs),
        'frame_data': local_frame_data
    }

def process_frames_multiproc(meta):
    """
    2) (alternativa) Orquestra o processamento em múltiplos processos (chunks):
       - Divide o vídeo com overlap para aquecer a janela de cada worker (split_indices).
       - Lança worker_chunk em paralelo (Pool.imap_unordered).
    3) Cada worker salva suas imagens diretamente nas pastas de saída.
    """
    ensure_dirs()  # garante que as pastas existem

    frame_count = meta['frame_count']
    fps = meta['fps']
    window_size = max(1, int(round(fps * WINDOW_SECONDS)))

    # cria os chunks com overlap
    parts = split_indices(frame_count, CHUNK_SIZE_FRAMES, window_size)
    print(f"[PROC] Multiprocess ativo: {NUM_PROCS} processos | {len(parts)} chunks "
          f"(chunk={CHUNK_SIZE_FRAMES}, overlap={window_size-1})")

    # empacota os argumentos para cada worker
    args_list = [(a, b, c, meta) for (a, b, c) in parts]
    
    # Aggregate frame data from all workers
    aggregated_frame_data = {
        'posture_angles': [],
        'overstride_frames': [],
        'success_frames': {
            'posture': [],
            'overstride': []
        }
    }

    # se for 1 chunk so
    if NUM_PROCS == 1:
        for args in args_list:
            result = worker_chunk(args)
            if result['logs']:
                print(result['logs'])
            # Aggregate data
            aggregated_frame_data['posture_angles'].extend(result['frame_data']['posture_angles'])
            aggregated_frame_data['overstride_frames'].extend(result['frame_data']['overstride_frames'])
            aggregated_frame_data['success_frames']['posture'].extend(result['frame_data']['success_frames']['posture'])
            aggregated_frame_data['success_frames']['overstride'].extend(result['frame_data']['success_frames']['overstride'])
    else:
        # paraleliza o processo com varios workers
        with Pool(processes=NUM_PROCS) as pool:
            for idx, result in enumerate(pool.imap_unordered(worker_chunk, args_list)):
                print(f"[PROC] chunk {idx+1}/{len(parts)} pronto")
                if result['logs']:
                    print(result['logs'])
                # Aggregate data
                aggregated_frame_data['posture_angles'].extend(result['frame_data']['posture_angles'])
                aggregated_frame_data['overstride_frames'].extend(result['frame_data']['overstride_frames'])
                aggregated_frame_data['success_frames']['posture'].extend(result['frame_data']['success_frames']['posture'])
                aggregated_frame_data['success_frames']['overstride'].extend(result['frame_data']['success_frames']['overstride'])
    
    # Sort frame data by frame number
    aggregated_frame_data['posture_angles'].sort(key=lambda x: x['frame_number'])
    aggregated_frame_data['overstride_frames'].sort(key=lambda x: x['frame_number'])
    
    # Save aggregated frame-level data to JSON file
    frame_data_path = os.path.join(OUT_DIR, 'frame_data.json')
    with open(frame_data_path, 'w') as f:
        json.dump(aggregated_frame_data, f, indent=2)
    print(f"[DATA] Frame-level data saved to: {frame_data_path}")

    print(f"[OK] Análises salvas em: {os.path.abspath(OUT_DIR)}")


# ------------------ FASTAPI INTEGRATION ------------------
app = FastAPI(title="MovUp Video Analysis API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for serving worst frame images
app.mount("/out", StaticFiles(directory=OUT_DIR), name="out")

def analyze_video_file(video_path: str) -> Dict[str, Any]:
    """
    Analyzes a video file and returns structured results.
    This function integrates the existing analysis logic with API response format.
    """
    try:
        # Reset output directories
        reset_out_dir()
        
        # Extract frames from video
        meta = extract_frames(video_path)
        
        # Process frames based on configuration
        if MULTIPROCESS:
            process_frames_multiproc(meta)
        else:
            process_frames_sequential(meta)
        
        # Collect analysis results
        analysis_results = collect_analysis_results(meta, video_path)
        
        return analysis_results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

def calculate_frame_severity(frame_num: int, error_type: str, total_frames: int) -> float:
    """
    Calculates a severity score for a frame based on various factors.
    This is a simplified implementation - you can enhance it based on your specific needs.
    """
    # Base severity calculation
    base_severity = 0.5
    
    # Factor 1: Position in video (later frames might be more indicative of fatigue)
    position_factor = frame_num / total_frames if total_frames > 0 else 0
    
    # Factor 2: Error type specific weights
    error_weights = {
        'posture': 0.8,      # Posture issues are generally more serious
        'overstride': 0.6,   # Overstride is moderate concern
        'visibility': 0.3    # Visibility issues are less critical
    }
    
    weight = error_weights.get(error_type, 0.5)
    
    # Calculate final severity score
    severity = base_severity + (position_factor * 0.3) + (weight * 0.2)
    
    # Ensure severity is between 0 and 1
    return min(1.0, max(0.0, severity))

def extract_worst_frames(video_path: str, meta: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extracts and saves the worst frame for each error type from the video.
    Returns a list of worst frame information.
    """
    worst_frames = []
    
    try:
        # Create output directory for worst frames
        worst_frames_dir = os.path.join(OUT_DIR, 'worst_frames')
        os.makedirs(worst_frames_dir, exist_ok=True)
        
        # Open video to extract frames
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[WORST_FRAMES] Warning: Could not open video {video_path}")
            return worst_frames
        
        fps = meta['fps']
        
        # Define error types and their corresponding directories
        error_types = {
            'posture': {
                'dir': os.path.join(OUT_DIR, 'postura_incorreta'),
                'description': 'Most severe posture error detected'
            },
            'overstride': {
                'dir': os.path.join(OUT_DIR, 'min_heel'),
                'description': 'Most severe overstride error detected'
            },
            'visibility': {
                'dir': os.path.join(OUT_DIR, 'baixa_visibilidade'),
                'description': 'Most severe visibility issue detected'
            }
        }
        
        for error_type, config in error_types.items():
            error_dir = config['dir']
            
            if not os.path.exists(error_dir):
                continue
                
            # Get all frame files for this error type
            frame_files = [f for f in os.listdir(error_dir) if f.endswith('.jpg')]
            
            if not frame_files:
                continue
            
            # Extract frame numbers and find the worst one
            frame_numbers = []
            for file in frame_files:
                try:
                    frame_num = int(file.split('_')[1].split('.')[0])
                    frame_numbers.append(frame_num)
                except (IndexError, ValueError):
                    continue
            
            if not frame_numbers:
                continue
            
            # Find the frame with the highest severity score
            worst_frame_num = None
            max_severity = 0
            
            for frame_num in frame_numbers:
                severity = calculate_frame_severity(frame_num, error_type, meta['frame_count'])
                if severity > max_severity:
                    max_severity = severity
                    worst_frame_num = frame_num
            
            # Fallback to highest frame number if no severity calculation
            if worst_frame_num is None:
                worst_frame_num = max(frame_numbers)
                max_severity = 0.7  # Default severity
            
            severity_score = max_severity
            
            # Extract the frame from video
            cap.set(cv2.CAP_PROP_POS_FRAMES, worst_frame_num)
            ret, frame = cap.read()
            
            if ret:
                # Save the worst frame
                filename = f"{error_type}_worst_frame_{worst_frame_num:06d}.jpg"
                filepath = os.path.join(worst_frames_dir, filename)
                
                # Save with high quality
                cv2.imwrite(filepath, frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
                
                worst_frames.append({
                    "error_type": error_type,
                    "frame_number": worst_frame_num,
                    "severity_score": severity_score,
                    "image_path": f"out/worst_frames/{filename}",
                    "description": config['description']
                })
                
                print(f"[WORST_FRAMES] Saved {error_type} worst frame: {filename}")
            else:
                print(f"[WORST_FRAMES] Warning: Could not extract frame {worst_frame_num} for {error_type}")
        
        cap.release()
        
    except Exception as e:
        print(f"[WORST_FRAMES] Error extracting worst frames: {str(e)}")
    
    return worst_frames

def collect_analysis_results(meta: Dict[str, Any], video_path: str = None) -> Dict[str, Any]:
    """
    Collects analysis results from the processed frames and formats them for API response.
    """
    fps = meta['fps']
    frame_count = meta['frame_count']
    total_duration_seconds = frame_count / fps if fps > 0 else 0
    
    # Initialize counters and worst frame info
    posture_issues_count = 0
    overstride_issues_count = 0
    visibility_issues_count = 0
    
    posture_worst_frame = 0
    overstride_worst_frame = 0
    visibility_worst_frame = 0
    
    posture_image_path = ""
    overstride_image_path = ""
    visibility_image_path = ""
    
    posture_success_image_path = ""
    overstride_success_image_path = ""
    
    # Load frame-level data from JSON file
    frame_data = {
        'posture_angles': [],
        'overstride_frames': [],
        'success_frames': {
            'posture': [],
            'overstride': []
        }
    }
    frame_data_path = os.path.join(OUT_DIR, 'frame_data.json')
    if os.path.exists(frame_data_path):
        try:
            with open(frame_data_path, 'r') as f:
                frame_data = json.load(f)
        except Exception as e:
            print(f"[WARN] Could not load frame data: {e}")
    
    # Collect posture issues
    posture_dir = os.path.join(OUT_DIR, 'postura_incorreta')
    if os.path.exists(posture_dir):
        posture_files = [f for f in os.listdir(posture_dir) if f.endswith('.jpg')]
        posture_issues_count = len(posture_files)
        
        # Find worst frame: frame with the smallest angle (worst posture)
        # Get all frames with errors and their angles
        posture_angles_list = frame_data.get('posture_angles', [])
        
        # Filter only frames with errors (angle <= BACK_ANGLE_BAD_THRESH)
        error_frames = [
            item for item in posture_angles_list 
            if item.get('angle', 999) <= BACK_ANGLE_BAD_THRESH
        ]
        
        if error_frames:
            # Find the frame with the minimum angle (worst posture)
            worst_frame_data = min(error_frames, key=lambda x: x.get('angle', 999))
            posture_worst_frame = worst_frame_data['frame_number']
            worst_angle = worst_frame_data['angle']
            posture_image_path = f"out/postura_incorreta/frame_{posture_worst_frame:06d}.jpg"
            print(f"[POSTURE] Worst frame selected: frame_{posture_worst_frame:06d} with angle {worst_angle}°")
        elif posture_files:
            # Fallback: if no angle data available, use highest frame number
            frame_numbers = []
            for file in posture_files:
                try:
                    frame_num = int(file.split('_')[1].split('.')[0])
                    frame_numbers.append(frame_num)
                except (IndexError, ValueError):
                    continue
             
            if frame_numbers:
                posture_worst_frame = max(frame_numbers)
                posture_image_path = f"out/postura_incorreta/frame_{posture_worst_frame:06d}.jpg"
    
    # Collect overstride issues
    overstride_dir = os.path.join(OUT_DIR, 'min_heel')
    
    # Get all overstride frames with angles from frame_data
    overstride_frames_list = frame_data.get('overstride_frames', [])
    
    # Filter frames with error (angle > 8) and success (angle <= 8 or None)
    error_frames = [
        item for item in overstride_frames_list 
        if item.get('overstride', False) and item.get('angle') is not None and item.get('angle', 0) > 8.0
    ]
    success_frames = [
        item for item in overstride_frames_list 
        if not item.get('overstride', True) or (item.get('angle') is not None and item.get('angle', 0) <= 8.0)
    ]
    
    # Count only frames with angle > 8
    overstride_issues_count = len(error_frames)
    
    # Clear existing error frames directory and save only the worst frame
    if os.path.exists(overstride_dir):
        # Remove all existing files
        for file in os.listdir(overstride_dir):
            try:
                os.remove(os.path.join(overstride_dir, file))
            except:
                pass
    
    # Find worst frame: frame with the highest angle (worst overstride) and save it
    overstride_worst_frame = 0
    overstride_image_path = ""
    worst_angle = 0.0
    if error_frames:
        worst_frame_data = max(error_frames, key=lambda x: x.get('angle', 0))
        overstride_worst_frame = worst_frame_data['frame_number']
        worst_angle = worst_frame_data['angle']
        
        # Extract and save the worst frame with annotations
        if video_path and os.path.exists(video_path):
            cap = cv2.VideoCapture(video_path)
            if cap.isOpened():
                cap.set(cv2.CAP_PROP_POS_FRAMES, overstride_worst_frame)
                ret, frame = cap.read()
                if ret:
                    # Process with MediaPipe to get landmarks for drawing
                    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    rgb.flags.writeable = False
                    with mp_pose.Pose(
                        static_image_mode=True,
                        model_complexity=MODEL_COMPLEXITY,
                        min_detection_confidence=MIN_DET_CONF,
                        min_tracking_confidence=MIN_TRK_CONF
                    ) as pose:
                        results = pose.process(rgb)
                        rgb.flags.writeable = True
                        frame = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
                        
                        if results.pose_landmarks:
                            h, w, _ = frame.shape
                            lm = results.pose_landmarks.landmark
                            heel_idx = mp_pose.PoseLandmark.RIGHT_HEEL.value
                            foot_idx = mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value
                            knee_idx = mp_pose.PoseLandmark.RIGHT_KNEE.value
                            
                            heel_lm = lm[heel_idx]
                            fidx_lm = lm[foot_idx]
                            knee_lm = lm[knee_idx]
                            
                            if is_visible(heel_lm) and is_visible(fidx_lm) and is_visible(knee_lm):
                                heel_px = to_pixel(heel_lm, w, h)
                                fidx_px = to_pixel(fidx_lm, w, h)
                                knee_px = to_pixel(knee_lm, w, h)
                                contact_px = heel_px + (fidx_px - heel_px) * CONTACT_RATIO
                                
                                # Draw annotations
                                cpt = (int(contact_px[0]), int(contact_px[1]))
                                cv2.circle(frame, cpt, 8, (0, 0, 255), -1)
                                top_point = (cpt[0], max(0, cpt[1] - int(h * 0.85)))
                                cv2.line(frame, cpt, top_point, (255, 0, 0), 2)
                                knee_pt = (int(knee_px[0]), int(knee_px[1]))
                                cv2.line(frame, cpt, knee_pt, (0, 255, 255), 2)
                                cv2.putText(frame, f"{worst_angle:.0f} deg",
                                            (cpt[0], max(0, cpt[1] - 10)),
                                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2, cv2.LINE_AA)
                    
                    os.makedirs(overstride_dir, exist_ok=True)
                    save_img(annotated_path('min_heel', overstride_worst_frame), frame)
                    overstride_image_path = f"out/min_heel/frame_{overstride_worst_frame:06d}.jpg"
                    print(f"[OVERSTRIDE] Worst error frame saved: frame_{overstride_worst_frame:06d} with angle {worst_angle}°")
                cap.release()
        else:
            # Fallback: use frames directory if video not available
            if overstride_worst_frame > 0:
                frame_path_check = frame_path(overstride_worst_frame)
                if os.path.exists(frame_path_check):
                    frame = cv2.imread(frame_path_check)
                    if frame is not None:
                        # Process with MediaPipe to get landmarks for drawing
                        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                        rgb.flags.writeable = False
                        with mp_pose.Pose(
                            static_image_mode=True,
                            model_complexity=MODEL_COMPLEXITY,
                            min_detection_confidence=MIN_DET_CONF,
                            min_tracking_confidence=MIN_TRK_CONF
                        ) as pose:
                            results = pose.process(rgb)
                            rgb.flags.writeable = True
                            frame = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
                            
                            if results.pose_landmarks:
                                h, w, _ = frame.shape
                                lm = results.pose_landmarks.landmark
                                heel_idx = mp_pose.PoseLandmark.RIGHT_HEEL.value
                                foot_idx = mp_pose.PoseLandmark.RIGHT_FOOT_INDEX.value
                                knee_idx = mp_pose.PoseLandmark.RIGHT_KNEE.value
                                
                                heel_lm = lm[heel_idx]
                                fidx_lm = lm[foot_idx]
                                knee_lm = lm[knee_idx]
                                
                                if is_visible(heel_lm) and is_visible(fidx_lm) and is_visible(knee_lm):
                                    heel_px = to_pixel(heel_lm, w, h)
                                    fidx_px = to_pixel(fidx_lm, w, h)
                                    knee_px = to_pixel(knee_lm, w, h)
                                    contact_px = heel_px + (fidx_px - heel_px) * CONTACT_RATIO
                                    
                                    # Draw annotations
                                    cpt = (int(contact_px[0]), int(contact_px[1]))
                                    cv2.circle(frame, cpt, 8, (0, 0, 255), -1)
                                    top_point = (cpt[0], max(0, cpt[1] - int(h * 0.85)))
                                    cv2.line(frame, cpt, top_point, (255, 0, 0), 2)
                                    knee_pt = (int(knee_px[0]), int(knee_px[1]))
                                    cv2.line(frame, cpt, knee_pt, (0, 255, 255), 2)
                                    cv2.putText(frame, f"{worst_angle:.0f} deg",
                                                (cpt[0], max(0, cpt[1] - 10)),
                                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2, cv2.LINE_AA)
                        
                        os.makedirs(overstride_dir, exist_ok=True)
                        save_img(annotated_path('min_heel', overstride_worst_frame), frame)
                        overstride_image_path = f"out/min_heel/frame_{overstride_worst_frame:06d}.jpg"
                        print(f"[OVERSTRIDE] Worst error frame saved: frame_{overstride_worst_frame:06d} with angle {worst_angle}°")
    
    # Find best success frame: frame with the lowest angle (best overstride) and save it
    overstride_success_image_path = ""
    success_frames_dir = os.path.join(OUT_DIR, 'success_frames')
    
    # Remove old overstride success frames
    if os.path.exists(success_frames_dir):
        old_files = [f for f in os.listdir(success_frames_dir) if f.startswith('overstride_success_')]
        for old_file in old_files:
            try:
                os.remove(os.path.join(success_frames_dir, old_file))
            except:
                pass
    
    if success_frames:
        # Filter only frames with valid angles (not None)
        valid_success_frames = [item for item in success_frames if item.get('angle') is not None]
        if valid_success_frames:
            best_frame_data = min(valid_success_frames, key=lambda x: x.get('angle', 999))
            overstride_success_frame_num = best_frame_data['frame_number']
            best_angle = best_frame_data['angle']
            
            # Extract frame from video to save as success
            if video_path and os.path.exists(video_path):
                cap = cv2.VideoCapture(video_path)
                if cap.isOpened():
                    cap.set(cv2.CAP_PROP_POS_FRAMES, overstride_success_frame_num)
                    ret, frame = cap.read()
                    if ret:
                        os.makedirs(success_frames_dir, exist_ok=True)
                        filename = f'overstride_success_{overstride_success_frame_num:06d}.jpg'
                        save_img(os.path.join(success_frames_dir, filename), frame)
                        overstride_success_image_path = f"out/success_frames/{filename}"
                        print(f"[OVERSTRIDE] Best success frame saved: frame_{overstride_success_frame_num:06d} with angle {best_angle}°")
                    cap.release()
            else:
                # Fallback: use frames directory if video not available
                frame_path_check = frame_path(overstride_success_frame_num)
                if os.path.exists(frame_path_check):
                    image = cv2.imread(frame_path_check)
                    if image is not None:
                        os.makedirs(success_frames_dir, exist_ok=True)
                        filename = f'overstride_success_{overstride_success_frame_num:06d}.jpg'
                        save_img(os.path.join(success_frames_dir, filename), image)
                        overstride_success_image_path = f"out/success_frames/{filename}"
                        print(f"[OVERSTRIDE] Best success frame saved: frame_{overstride_success_frame_num:06d} with angle {best_angle}°")
    
    # Collect visibility issues
    visibility_dir = os.path.join(OUT_DIR, 'baixa_visibilidade')
    if os.path.exists(visibility_dir):
        visibility_files = [f for f in os.listdir(visibility_dir) if f.endswith('.jpg')]
        visibility_issues_count = len(visibility_files)
        
        # Find worst frame
        if visibility_files:
            frame_numbers = []
            for file in visibility_files:
                try:
                    frame_num = int(file.split('_')[1].split('.')[0])
                    frame_numbers.append(frame_num)
                except (IndexError, ValueError):
                    continue
            
            if frame_numbers:
                visibility_worst_frame = max(frame_numbers)
                visibility_image_path = f"out/baixa_visibilidade/frame_{visibility_worst_frame:06d}.jpg"
    
    # Calculate frames with success (frames without errors)
    posture_success_frames = frame_count - posture_issues_count
    overstride_success_frames = frame_count - overstride_issues_count
    visibility_success_frames = frame_count - visibility_issues_count
    
    # Get success frame image paths
    success_frames_dir = os.path.join(OUT_DIR, 'success_frames')
    if os.path.exists(success_frames_dir):
        # Find posture success image
        posture_success_files = [f for f in os.listdir(success_frames_dir) if f.startswith('posture_success_')]
        if posture_success_files:
            posture_success_image_path = f"out/success_frames/{posture_success_files[0]}"
        
        # Find overstride success image (if not already set above)
        if not overstride_success_image_path:
            overstride_success_files = [f for f in os.listdir(success_frames_dir) if f.startswith('overstride_success_')]
            if overstride_success_files:
                overstride_success_image_path = f"out/success_frames/{overstride_success_files[0]}"
    
    # Build result structure in the requested format
    result = {
        "status": "success",
        "analysis": [
            {
                "posture": {
                    "Número de frames com erro": posture_issues_count,
                    "Número de frames com sucesso": posture_success_frames,
                    "worst_frame_number": posture_worst_frame,
                    "image_path": posture_image_path,
                    "success_image_path": posture_success_image_path,
                    "angles": frame_data.get('posture_angles', [])
                }
            },
            {
                "overstride": {
                    "Número de frames com erro": overstride_issues_count,
                    "Número de frames com sucesso": overstride_success_frames,
                    "worst_frame_number": overstride_worst_frame,
                    "image_path": overstride_image_path,
                    "success_image_path": overstride_success_image_path,
                    "frames": frame_data.get('overstride_frames', [])
                }
            },
            {
                "baixa_visibilidade": {
                    "Número de frames com erro": visibility_issues_count,
                    "Número de frames com sucesso": visibility_success_frames,
                    "worst_frame_number": visibility_worst_frame,
                    "image_path": visibility_image_path
                }
            }
        ],
        "summary": {
            "total_frames": frame_count,
            "fps": fps,
            "total_duration_seconds": total_duration_seconds,
            "posture_issues_count": posture_issues_count,
            "overstride_issues_count": overstride_issues_count,
            "visibility_issues_count": visibility_issues_count
        }
    }
    
    print(result)
        
    return result

@app.post("/analisar-video/")
async def analyze_video(file: UploadFile = File(...)):
    """
    API endpoint to receive uploaded video and return analysis results.
    """
    if not file.content_type or not file.content_type.startswith('video/'):
        raise HTTPException(status_code=400, detail="File must be a video")
    
    # Create temporary file for the uploaded video
    with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
        try:
            # Write uploaded file to temporary location
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()
            
            # Analyze the video
            results = analyze_video_file(temp_file.name)
            
            return JSONResponse(content=results)
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
        
        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_file.name)
            except:
                pass

@app.get("/api/worst_frame/{error_type}/{filename}")
async def get_worst_frame_image(error_type: str, filename: str):
    """
    API endpoint to serve worst frame images.
    """
    try:
        # Validate error type
        valid_types = ['posture', 'overstride', 'visibility']
        if error_type not in valid_types:
            raise HTTPException(status_code=400, detail="Invalid error type")
        
        # Construct file path
        file_path = os.path.join(OUT_DIR, 'worst_frames', filename)
        
        # Check if file exists
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Return the image file
        return FileResponse(file_path, media_type="image/jpeg")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to serve image: {str(e)}")

@app.get("/")
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "message": "MovUp Video Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analisar-video/",
            "health": "/health",
            "save_report": "/api/save_report",
            "worst_frame": "/api/worst_frame/{error_type}/{filename}"
        }
    }

# ------------------ MAIN ------------------
if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=True)
