# MovUp - Video Analysis Integration

This project integrates a React frontend with a Python backend for video analysis of running posture and biomechanics.

## Project Structure

```
MovUp/
├── FRONT/                    # React frontend application
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useVideoUpload.js    # Video upload hook
│   │   ├── pages/
│   │   │   ├── Video.jsx            # Video upload page
│   │   │   └── ReportPage.jsx       # Analysis report page
│   │   └── ...
├── AI/                       # Python backend with video analysis
│   ├── root.py              # FastAPI server with analysis logic
│   ├── requirements.txt     # Python dependencies
│   └── ...
├── start_backend.sh         # Linux/Mac startup script
├── start_backend.bat        # Windows startup script
└── README.md               # This file
```

## Features

- **Video Upload**: Upload video files through the React frontend
- **Real-time Analysis**: Backend processes videos using MediaPipe for pose detection
- **Posture Analysis**: Detects back posture issues and overstride problems
- **Detailed Reports**: Displays analysis results with frame-by-frame breakdown
- **RESTful API**: Clean FastAPI backend with proper error handling

## Setup Instructions

### Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- npm or yarn package manager

### Backend Setup (Python/FastAPI)

1. **Navigate to the AI directory:**
   ```bash
   cd AI
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   
   # On Windows:
   venv\Scripts\activate
   
   # On Linux/Mac:
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the backend server:**
   ```bash
   python root.py
   ```
   
   Or use the provided scripts:
   - **Windows:** Double-click `start_backend.bat`
   - **Linux/Mac:** Run `./start_backend.sh`

The API will be available at `http://127.0.0.1:8000`

### Frontend Setup (React)

1. **Navigate to the FRONT directory:**
   ```bash
   cd FRONT
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` (or similar)

## API Endpoints

### POST `/analisar-video/`
Uploads and analyzes a video file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: video file

**Response:**
```json
{
  "status": "success",
  "analysis": [
    {
      "frame": 10,
      "time_seconds": 0.33,
      "issue_type": "posture",
      "issue": "Back posture angle below threshold",
      "severity": "medium"
    }
  ],
  "summary": {
    "total_frames": 300,
    "fps": 30.0,
    "total_duration_seconds": 10.0,
    "posture_issues_count": 5,
    "overstride_issues_count": 3,
    "visibility_issues_count": 2
  }
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "MovUp API is running"
}
```

### GET `/`
API information endpoint.

## Usage

1. **Start both servers:**
   - Backend: `python AI/root.py` (or use startup scripts)
   - Frontend: `npm run dev` in FRONT directory

2. **Upload a video:**
   - Navigate to the Video page in the frontend
   - Click "CARREGUE SUA CORRIDA" to select a video file
   - Preview the video and click "Analisar"

3. **View results:**
   - The analysis will run automatically
   - Results are displayed on the Report page
   - Includes frame-by-frame analysis and summary statistics

## Analysis Features

The backend analyzes videos for:

- **Posture Issues**: Detects when back angle is below threshold (poor posture)
- **Overstride Detection**: Identifies potential overstride during running
- **Visibility Issues**: Flags frames with insufficient landmark visibility

## Error Handling

- **Frontend**: Displays user-friendly error messages
- **Backend**: Returns proper HTTP status codes and error details
- **File Validation**: Ensures only video files are accepted
- **CORS**: Configured for frontend-backend communication

## Development

### Backend Development
- FastAPI with automatic API documentation at `/docs`
- MediaPipe for pose detection
- OpenCV for video processing
- Multiprocessing support for large videos

### Frontend Development
- React with PrimeReact components
- Custom hooks for API communication
- Responsive design with Tailwind CSS
- Error handling and loading states

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend is running on `127.0.0.1:8000`
2. **Video Upload Fails**: Check file size and format (MP4 recommended)
3. **Analysis Takes Long**: Large videos may take several minutes to process
4. **Dependencies Issues**: Ensure all Python packages are installed correctly

### Logs
- Backend logs are displayed in the terminal
- Frontend logs are available in browser console
- Check network tab for API request/response details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
