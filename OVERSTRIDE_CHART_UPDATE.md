# Overstride Chart Update - Grouped by Seconds

## Overview
Updated the overstride chart to group data by seconds instead of individual frames, providing a clearer time-based visualization.

---

## ✅ Implementation Details

### File Modified
**`FRONT/src/components/IssueGraph.jsx`**

### Changes Made

#### 1. **Data Grouping Logic**
```javascript
// Group frames by seconds
const secondsData = {};

data.forEach(item => {
  const second = Math.floor((item.frame || item.frame_number) / fps);
  
  if (!secondsData[second]) {
    secondsData[second] = {
      second: second,
      hasOverstride: false,
      frameCount: 0
    };
  }
  
  secondsData[second].frameCount += 1;
  
  // If ANY frame in this second has overstride, mark the second as having overstride
  if (item.overstride) {
    secondsData[second].hasOverstride = true;
  }
});
```

**Logic**:
- Groups all frames into their respective seconds
- Checks if **at least one frame** in each second has overstride
- Records `1` if overstride occurred, `0` if not

#### 2. **Chart Data Format**
```javascript
const chartData = Object.values(secondsData).map(item => ({
  second: item.second,
  overstride: item.hasOverstride ? 1 : 0,
  label: item.hasOverstride ? 'Overstride' : 'Normal'
})).sort((a, b) => a.second - b.second);
```

**Output Structure**:
```json
[
  { "second": 0, "overstride": 0, "label": "Normal" },
  { "second": 1, "overstride": 1, "label": "Overstride" },
  { "second": 2, "overstride": 0, "label": "Normal" },
  { "second": 3, "overstride": 1, "label": "Overstride" }
]
```

#### 3. **Chart Type Change**
- **From**: ScatterChart (individual points)
- **To**: BarChart (bars per second)

#### 4. **Visual Components**

**Import Added**:
```javascript
import { BarChart, Bar } from 'recharts';
```

**Chart Configuration**:
- **X-Axis**: Seconds (time)
- **Y-Axis**: Binary (0 or 1)
  - 0 = "Não" (No overstride)
  - 1 = "Sim" (Overstride detected)
- **Colors**:
  - Red (#ff4444): Overstride detected
  - Green (#00C49F): No overstride

---

## 📊 Visualization

### Bar Chart Display

```
Y-Axis (Overstride)
     1 (Sim)   |  ▓  |     |  ▓  |  ▓  |     |  ▓  |
     0 (Não)   |     |  ▓  |     |     |  ▓  |     |
               ─────────────────────────────────────
                 0    1    2    3    4    5    6   → X-Axis (Seconds)
```

### Color Coding
- 🟥 **Red bars**: Second where overstride was detected
- 🟢 **Green bars**: Second with no overstride

---

## 🎯 Features

### 1. **Time-Based Grouping**
- Each bar represents one second of running
- Clear temporal visualization
- Easy to identify problematic time periods

### 2. **Binary Decision**
- Simple Yes/No per second
- If **any frame** in a second has overstride → 1
- If **all frames** are clean → 0

### 3. **Interactive Tooltip**
Hover over any bar to see:
```
Segundo: 3
Overstride: Sim
```

### 4. **Count Display**
Caption shows:
```
Cada barra representa um segundo. 
Vermelho = overstride detectado (4/7 segundos)
```

### 5. **Empty States**
- **No data**: "Nenhum momento de contato com solo analisado"
- **No overstride**: "✓ Nenhum overstride detectado (boa técnica!)"

---

## 🔄 Data Flow

### Input (from Backend)
```json
{
  "frames": [
    { "frame_number": 30, "overstride": true },
    { "frame_number": 32, "overstride": false },
    { "frame_number": 60, "overstride": true },
    { "frame_number": 90, "overstride": true },
    { "frame_number": 92, "overstride": false }
  ]
}
```

### Processing (fps = 30)
```javascript
// Frame 30, 32 → Second 1
// Frame 60 → Second 2
// Frame 90, 92 → Second 3

// Second 1: Has frame 30 with overstride=true → 1
// Second 2: Has frame 60 with overstride=true → 1
// Second 3: Has frame 90 with overstride=true → 1
```

### Output (Chart Data)
```json
[
  { "second": 1, "overstride": 1 },
  { "second": 2, "overstride": 1 },
  { "second": 3, "overstride": 1 }
]
```

---

## 📈 Advantages

### Over Frame-Based Display
1. **Clarity**: Easier to see time progression
2. **Reduced Noise**: Less visual clutter
3. **Context**: Shows duration of issues
4. **Simplicity**: Binary decision per second

### User Benefits
1. **Quick Assessment**: See at a glance which seconds have issues
2. **Temporal Pattern**: Identify if overstride worsens over time
3. **Fatigue Analysis**: Detect if issues appear later in run
4. **Goal Setting**: Track improvement over time

---

## 🎨 Styling

### Chart Dimensions
- Width: 100% (responsive)
- Min Width: 800px (scrollable on small screens)
- Height: 300px

### Colors
- **Overstride Bar**: `#ff4444` (red)
- **Normal Bar**: `#00C49F` (green)
- **Grid**: Light gray dashed lines

### Layout
- Horizontal scrolling for long videos
- Thin scrollbar style
- Clean, modern appearance

---

## 🧪 Testing Scenarios

### Scenario 1: Mixed Results
**Input**: Video with some overstride moments
```
Second 0: No overstride → Green bar (0)
Second 1: Overstride → Red bar (1)
Second 2: No overstride → Green bar (0)
Second 3: Overstride → Red bar (1)
```

**Expected Display**: Alternating red and green bars

### Scenario 2: Perfect Technique
**Input**: Video with no overstride
```
All seconds: No overstride → All green bars (0)
```

**Expected Display**: All green bars, or success message

### Scenario 3: Poor Technique
**Input**: Video with frequent overstride
```
Most seconds: Overstride → Mostly red bars (1)
```

**Expected Display**: Predominantly red bars

### Scenario 4: Fatigue Pattern
**Input**: Good start, poor finish
```
Seconds 0-5: No overstride → Green
Seconds 6-10: Overstride → Red
```

**Expected Display**: Green bars transitioning to red

---

## 💡 Algorithm Details

### Grouping Function
```javascript
function groupBySeconds(frames, fps) {
  const grouped = {};
  
  frames.forEach(frame => {
    const second = Math.floor(frame.frame_number / fps);
    
    if (!grouped[second]) {
      grouped[second] = { hasOverstride: false };
    }
    
    if (frame.overstride) {
      grouped[second].hasOverstride = true;
    }
  });
  
  return Object.entries(grouped).map(([sec, data]) => ({
    second: parseInt(sec),
    overstride: data.hasOverstride ? 1 : 0
  }));
}
```

### Time Complexity
- **O(n)**: Single pass through frames
- **O(m log m)**: Sorting m seconds
- **Overall**: O(n + m log m) where n = frames, m = seconds

### Space Complexity
- **O(m)**: Storage for m seconds
- Significantly less than storing all frames

---

## 🔧 Customization Options

### Change to Line Chart
Replace `BarChart` and `Bar` with:
```javascript
<LineChart data={chartData}>
  <Line 
    type="stepAfter" 
    dataKey="overstride" 
    stroke="#ff4444"
    strokeWidth={2}
  />
</LineChart>
```

### Adjust Sensitivity
To require **all frames** in a second to have overstride:
```javascript
// Change from ANY to ALL
if (item.overstride) {
  secondsData[second].overstrideCount += 1;
}

// After grouping
hasOverstride: 
  secondsData[second].overstrideCount === secondsData[second].frameCount
```

### Add Percentage Display
Show percentage of frames with overstride per second:
```javascript
overstride: (overstrideCount / frameCount) * 100
```

---

## 📋 Comparison: Before vs After

| Aspect | Before (Frames) | After (Seconds) |
|--------|----------------|-----------------|
| **Granularity** | Per frame | Per second |
| **Data Points** | ~30 per second | 1 per second |
| **Visual Clarity** | Cluttered | Clean |
| **Pattern Recognition** | Difficult | Easy |
| **Performance** | More rendering | Less rendering |
| **User Understanding** | Complex | Simple |

---

## 🚀 Performance Impact

### Data Reduction
- **Before**: 30 frames/second × 10 seconds = 300 data points
- **After**: 1 data point/second × 10 seconds = 10 data points
- **Reduction**: 97% fewer data points to render

### Rendering Speed
- Faster chart rendering
- Smoother interactions
- Better mobile performance

### Memory Usage
- Reduced memory footprint
- Efficient data structure
- Optimized for long videos

---

## 📱 Responsive Design

### Mobile
- Touch-friendly bar width
- Horizontal scroll enabled
- Clear tap targets

### Tablet
- Optimal bar spacing
- Good readability
- Smooth scrolling

### Desktop
- Full chart visible
- Detailed tooltips
- Keyboard navigation

---

## 🎓 User Education

### Chart Reading Guide
1. **X-Axis**: Shows time in seconds
2. **Y-Axis**: Shows if overstride occurred
3. **Red Bar**: Overstride detected in that second
4. **Green Bar**: No overstride in that second
5. **Height**: Always at 1 (detected) or 0 (not detected)

### Interpretation
- **Isolated red bars**: Occasional overstride
- **Clusters of red**: Repeated issues
- **Late red bars**: Fatigue-related problems
- **All green**: Perfect technique!

---

## 🔮 Future Enhancements

### Potential Additions
1. **Severity Levels**: Show how many frames per second
2. **Trend Line**: Average over time
3. **Comparison Mode**: Compare multiple runs
4. **Zone Highlighting**: Mark problematic periods
5. **Animation**: Animate progression through time

---

## ✅ Summary

**What Changed**:
- Overstride chart now groups data by seconds
- Binary display: 1 (overstride) or 0 (no overstride)
- Bar chart visualization
- Time-based x-axis

**Benefits**:
- Clearer visualization
- Better performance
- Easier interpretation
- Professional appearance

**Status**: ✅ Implemented and tested

---

**Version**: 2.2.0
**Date**: October 22, 2025
**Component**: `IssueGraph.jsx`
**Chart Type**: Bar Chart (grouped by seconds)

