# Quick Start Guide: Frame-Level Data Visualization

## Installation

### 1. Install Frontend Dependencies
```bash
cd FRONT
npm install
```

This will install the new `recharts` library required for the interactive charts.

## Running the Application

### 1. Start Backend Server
```bash
cd AI
python root.py
```

The backend will be available at `http://127.0.0.1:8000`

### 2. Start Frontend Dev Server
```bash
cd FRONT
npm run dev
```

The frontend will be available at `http://localhost:5173` (or the port shown in terminal)

## Using the New Features

### 1. Upload a Video
- Navigate to the upload page
- Select and upload a running video
- Wait for analysis to complete

### 2. View the Report
- After analysis, you'll see the report page
- Scroll to the "Análise Detalhada por Tipo de Problema" section

### 3. Interactive Charts
You'll now see two new charts:

#### Posture Chart (Line Chart)
- **Location**: Below the worst posture frame image
- **Shows**: Angle measurements for every frame
- **Red Line**: 110° threshold (values below this indicate incorrect posture)
- **Blue Line**: Actual angle values
- **Interaction**: Hover over any point to see frame number and exact angle

#### Overstride Chart (Scatter Chart)
- **Location**: Below the worst overstride frame image
- **Shows**: Overstride detection status for every frame
- **Red Dots**: Frames where overstride was detected
- **Green Dots**: Normal frames (no overstride)
- **Interaction**: Hover over any dot to see frame number and status

## What's New in the API Response

The `/analisar-video` endpoint now returns additional data:

```json
{
  "status": "success",
  "analysis": [
    {
      "posture": {
        "Número de frames com erro": 10,
        "Número de frames com sucesso": 290,
        "worst_frame_number": 150,
        "image_path": "out/postura_incorreta/frame_000150.jpg",
        "success_image_path": "out/success_frames/posture_success_000050.jpg",
        "angles": [
          {"frame_number": 0, "angle": 125.5},
          {"frame_number": 1, "angle": 123.2}
        ]
      }
    },
    {
      "overstride": {
        "Número de frames com erro": 5,
        "Número de frames com sucesso": 295,
        "worst_frame_number": 200,
        "image_path": "out/min_heel/frame_000200.jpg",
        "success_image_path": "out/success_frames/overstride_success_000100.jpg",
        "frames": [
          {"frame_number": 0, "overstride": false},
          {"frame_number": 42, "overstride": true}
        ]
      }
    }
  ],
  "summary": {...}
}
```

## Troubleshooting

### Charts Not Showing
1. Check browser console for errors
2. Ensure `npm install` completed successfully
3. Verify the backend is returning `angles` and `frames` arrays in the response

### Backend Errors
1. Check that all Python dependencies are installed
2. Verify the `out` directory is being created
3. Check `out/frame_data.json` exists after video processing

### Performance Issues
1. For very long videos (>2 minutes), chart rendering may take a moment
2. Consider using `MULTIPROCESS = True` in `root.py` for faster processing
3. Charts are optimized for videos up to 5 minutes

## Chart Customization

The charts can be customized by editing `FRONT/src/components/IssueGraph.jsx`:

- **Colors**: Change `stroke` and `fill` properties
- **Size**: Modify `ResponsiveContainer height` prop
- **Threshold**: Update the reference line value in posture chart
- **Labels**: Edit axis labels and tooltip formatters

## Support

For issues or questions:
1. Check the `IMPLEMENTATION_SUMMARY.md` for detailed technical information
2. Review the console logs for error messages
3. Verify all file changes were applied correctly

