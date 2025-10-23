# Quick Update Guide

## 🎯 What's New

This update adds:
1. ✅ Always-visible posture and overstride sections
2. 🎠 Image carousel showing error and success frames
3. 📊 Time-based posture charts (average angle per second)
4. 🎯 Filtered overstride charts (ground contact moments only)
5. 📄 Enhanced PDF export with images and chart descriptions

---

## 🚀 Installation Steps

### 1. Frontend Dependencies
The new features use existing dependencies:
- ✅ `primereact` (already installed - includes Galleria for carousel)
- ✅ `recharts` (already installed - for charts)

No new dependencies needed!

### 2. Verify Installation
```bash
cd FRONT
npm install  # Just to ensure everything is up to date
```

---

## 🏃 Running the Updated System

### Start Backend
```bash
cd AI
python root.py
```
Backend runs on `http://127.0.0.1:8000`

### Start Frontend
```bash
cd FRONT
npm run dev
```
Frontend runs on `http://localhost:5173`

---

## 📋 What Changed

### New Files
- `FRONT/src/components/ImageCarousel.jsx` - Image carousel component

### Modified Files
1. `FRONT/src/hooks/useReportData.js` - Always show sections, add success images
2. `FRONT/src/components/IssueGraph.jsx` - Time-based charts, filtered data
3. `FRONT/src/components/AnalysisSection.jsx` - Use carousel instead of single image
4. `FRONT/src/components/ExportOptions.jsx` - Enhanced PDF with images
5. `FRONT/src/pages/ReportPage.jsx` - Pass new props

---

## 🎨 New Features in Action

### 1. Always-Visible Sections
**Before**: Sections hidden when no errors
**After**: Posture and overstride always show

### 2. Image Carousel
**Before**: Only worst frame image
**After**: Swipeable carousel with error + success frames

### 3. Time-Based Posture Chart
**Before**: X-axis showed frame numbers
**After**: X-axis shows seconds, Y-axis shows average angle per second

### 4. Filtered Overstride Chart
**Before**: All frames (true/false mix)
**After**: Only ground contact moments (red dots)

### 5. Enhanced PDF Export
**Before**: Simple text report
**After**: Professional layout with side-by-side images and chart descriptions

---

## 🧪 Quick Test

1. **Upload a Video**
   - Go to upload page
   - Select a running video
   - Wait for analysis

2. **Check Analysis Page**
   - ✅ Both posture and overstride sections visible
   - ✅ Carousel shows error and success frames
   - ✅ Posture chart shows time in seconds
   - ✅ Overstride chart shows only detection points

3. **Test PDF Export**
   - Click "Exportar para PDF"
   - Verify images appear side-by-side
   - Check chart placeholders are present

---

## 🔧 Troubleshooting

### Issue: Carousel not showing
**Solution**: Check that backend returns `success_image_path` in API response

### Issue: Charts showing wrong data
**Solution**: Verify `fps` is being passed correctly from backend

### Issue: PDF missing images
**Solution**: Ensure image URLs are accessible (check CORS if needed)

### Issue: Sections not appearing
**Solution**: Check console for errors, verify API response structure

---

## 📊 API Response Format

Your backend should return:
```json
{
  "analysis": [
    {
      "posture": {
        "image_path": "out/postura_incorreta/frame_000150.jpg",
        "success_image_path": "out/success_frames/posture_success_000050.jpg",
        "angles": [
          {"frame_number": 0, "angle": 125.5}
        ]
      }
    },
    {
      "overstride": {
        "image_path": "out/min_heel/frame_000200.jpg",
        "success_image_path": "out/success_frames/overstride_success_000100.jpg",
        "frames": [
          {"frame_number": 42, "overstride": true}
        ]
      }
    }
  ],
  "summary": {
    "fps": 30,
    "total_frames": 300
  }
}
```

---

## ✅ Verification Checklist

After updating, verify:

- [ ] Frontend starts without errors
- [ ] Backend provides updated API response
- [ ] Posture section always visible
- [ ] Overstride section always visible
- [ ] Carousel shows multiple images
- [ ] Posture chart shows seconds on X-axis
- [ ] Overstride chart filters to detections only
- [ ] PDF export includes images
- [ ] PDF export includes chart placeholders
- [ ] No console errors
- [ ] No linter warnings

---

## 🆘 Need Help?

1. Check browser console for errors
2. Verify backend API response format
3. Review `UPDATED_FEATURES_SUMMARY.md` for details
4. Check that all files were updated correctly

---

## 📝 Quick Commands

```bash
# Frontend
cd FRONT
npm install        # Install/update dependencies
npm run dev        # Start dev server
npm run build      # Build for production

# Backend
cd AI
python root.py     # Start backend server
```

---

## 🎉 You're All Set!

The system is now updated with:
- ✅ Enhanced visualizations
- ✅ Better user experience
- ✅ Professional PDF reports
- ✅ More informative charts

Upload a video and see the improvements! 🚀

