import cv2
import mediapipe as mp
import numpy as np

mp_drawing = mp.solutions.drawing_utils
mp_pose = mp.solutions.pose

def calculate_back_posture(a,b,c):
    a = np.array(a) #ombro
    b = np.array(b) #cintura
    c = np.array(c) #pe

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)

    if angle > 180.0:
        angle = 360-angle
    
    return angle

cap = cv2.VideoCapture('run.mp4')
#carregando modelo
with mp_pose.Pose(min_detection_confidence = 0.5, min_tracking_confidence = 0.5) as pose: 
    #WEBCAM
    while cap.isOpened(): 
        ret, frame = cap.read()

        #filtro de cor para rgb
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False

        #detecta
        results = pose.process(image)

        #filtro de cor para bgr
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        landmarks = results.pose_landmarks.landmark
        shoulder = [landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value].y]
        hip = [landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].x, landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value].y]
        knee = [landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].x,landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value].y]

        #landmarks[mp_pose.PoseLandMark.LEFT_SHOUDER.value]        

        #desenha deteccoes na tela
        mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        cv2.imshow('Mediapipe Feed', image)
        if cv2.waitKey(10) & 0xFF == ord('q'):
            break

        if calculate_back_posture(shoulder,hip,knee) <= 110:
            print("problema")
        

    cap.release()
    cv2.destroyAllWindows()

