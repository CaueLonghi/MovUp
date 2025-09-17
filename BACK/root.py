from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import numpy as np
import tempfile
import shutil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose


def calculate_back_posture(a, b, c):
    a = np.array(a)  # ombro
    b = np.array(b)  # quadril
    c = np.array(c)  # joelho

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)

    if angle > 180.0:
        angle = 360 - angle

    return angle


@app.post("/analisar-video/")
async def analisar_video(file: UploadFile = File(...)):
    # Salvar vídeo temporariamente
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as tmp:
        shutil.copyfileobj(file.file, tmp)
        video_path = tmp.name

    cap = cv2.VideoCapture(video_path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    posturas_erradas = []
    frame_number = 0

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_number += 1
            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            image.flags.writeable = False
            results = pose.process(image)
            image.flags.writeable = True

            if results.pose_landmarks:
                landmarks = results.pose_landmarks.landmark
                shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,
                            landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
                hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x,
                       landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
                knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,
                        landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]

                angle = calculate_back_posture(shoulder, hip, knee)

                # Direção da coluna
                if shoulder[0] > hip[0]:
                    direcao = "para frente"
                else:
                    direcao = "normal"

                if angle <= 110:
                    timestamp_sec = frame_number / fps
                    posturas_erradas.append({
                        "frame": frame_number,
                        "second": round(timestamp_sec, 2),
                        "angle": round(angle, 2),
                        "direcao": direcao
                    })

    cap.release()

    # Relatório final
    if posturas_erradas:
        total_seconds_erradas = len(posturas_erradas) / fps
        percentual = (len(posturas_erradas) / total_frames) * 100
    else:
        total_seconds_erradas = 0
        percentual = 0

    response = {
        "total_frames": total_frames,
        "fps": fps,
        "posturas_erradas": posturas_erradas,
        "tempo_total_errado_segundos": round(total_seconds_erradas, 2),
        "percentual_errado": round(percentual, 2)
    }

    return JSONResponse(content=response)
