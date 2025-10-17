# ====================== IMPORT DAS BIBLIOTECAS ======================
import os
import shutil
import cv2
import numpy as np
from multiprocessing import Pool, cpu_count

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
WINDOW_SECONDS = 1.4                # janela de segundos para captura do overstride
COOLDOWN_SECONDS = 0.35             # tempo mínimo entre detecções consecutivas do calcanhar, evitar pegar o pe no meio da esteira

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

                            # ----------------Desenhos no frame--------------
                            cpt = (int(contact_px[0]), int(contact_px[1]))
                            cv2.circle(image, cpt, 8, (0, 0, 255), -1)

                            top_point = (cpt[0], max(0, cpt[1] - int(h * 0.85)))
                            cv2.line(image, cpt, top_point, (255, 0, 0), 2)

                            knee_pt = (int(knee_px[0]), int(knee_px[1]))
                            cv2.line(image, cpt, knee_pt, (0, 255, 255), 2)

                            cv2.putText(image, f"{angle_deg:.0f} deg",
                                        (cpt[0], max(0, cpt[1] - 10)),
                                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255,255,255), 2, cv2.LINE_AA)

                            print(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8)")
                            save_img(annotated_path('min_heel', i), image)

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

                    if angle <= BACK_ANGLE_BAD_THRESH and i >= effective_start:
                        mp_drawing.draw_landmarks(
                            image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                            mp_drawing.DrawingSpec(color=(0, 0, 255), thickness=2, circle_radius=2),
                        )
                        local_logs.append(f"[POSTURA] frame={i} angle={round(angle,1)}° (ruim)")
                        save_img(annotated_path('postura_incorreta', i), image)
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

                            if i >= effective_start:
                                cpt = (int(contact_px[0]), int(contact_px[1]))
                                cv2.circle(image, cpt, 8, (0, 0, 255), -1)

                                top_point = (cpt[0], max(0, cpt[1] - int(h * 0.70)))
                                cv2.line(image, cpt, top_point, (255, 0, 0), 2)

                                knee_pt = (int(knee_px[0]), int(knee_px[1]))
                                cv2.line(image, cpt, knee_pt, (0, 255, 255), 2)

                                local_logs.append(f"[HEEL] frame={i} lowest_y={lowest_heel_y:.4f} angle={angle_deg:.2f}° (ratio=2/8)")
                                save_img(annotated_path('min_heel', i), image)

                            detection_cooldown = cooldown_frames

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

    # devolve as linhas de log para o processo pai imprimir
    return "\n".join(local_logs)

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

    # se for 1 chunk so
    if NUM_PROCS == 1:
        logs_all = []
        for args in args_list:
            logs_all.append(worker_chunk(args))
        print("\n".join(logs_all))
        print(f"[OK] Análises salvas em: {os.path.abspath(OUT_DIR)}")
        return

    # paraleliza o processo com varios workers
    with Pool(processes=NUM_PROCS) as pool:
        for idx, log in enumerate(pool.imap_unordered(worker_chunk, args_list)):
            print(f"[PROC] chunk {idx+1}/{len(parts)} pronto")
            if log:
                print(log)

    print(f"[OK] Análises salvas em: {os.path.abspath(OUT_DIR)}")


# ------------------ MAIN ------------------
if __name__ == "__main__":
    # Limpa pastas de SAÍDA e de FRAMES e cria tudo do zero
    reset_out_dir()  
    # a extração de frames já executa reset_frames_dir() por dentro

    # 1) Transformar o vídeo em frames
    meta = extract_frames(VIDEO_PATH)

    # 2) Analisar frames (sequencial ou em chunks), checando as costas e overstride
    if MULTIPROCESS:
        process_frames_multiproc(meta)
        # 3) Salvar frames conforme a análise
    else:
        process_frames_sequential(meta)
        # 3) Salvar frames conforme a análise
