# MovUp Frontend - Refactored Codebase

## Overview

This is a comprehensive refactoring of the MovUp frontend application, focusing on video upload, analysis, and report generation. The codebase has been completely restructured following React best practices with improved modularity, maintainability, and performance.

## 🏗️ Architecture

### Core Components

```
src/
├── components/          # Reusable UI components
│   ├── AnalysisSection.jsx
│   ├── ErrorMessage.jsx
│   ├── ExportOptions.jsx
│   ├── LoadingSpinner.jsx
│   ├── PageHeader.jsx
│   └── SummaryContainer.jsx
├── config/             # Configuration and constants
│   └── constants.js
├── hooks/              # Custom React hooks
│   ├── useReportData.js
│   └── useVideoUpload.js
├── pages/              # Main application pages
│   ├── ReportPage.jsx
│   └── Video.jsx
└── utils/              # Utility functions
    ├── formatters.js
    └── validators.js
```

## 🚀 Key Features

### 1. **Video Upload & Analysis**
- **File Validation**: Comprehensive video file validation
- **Progress Tracking**: Real-time upload progress with visual feedback
- **Error Handling**: Robust error handling with user-friendly messages
- **Multiple Upload Methods**: File selection and video recording support

### 2. **Report Generation**
- **Dynamic Analysis**: Real-time analysis of biomechanical issues
- **Worst Frame Detection**: Automatic identification and display of problematic frames
- **Interactive Reports**: Detailed breakdown by issue type (posture, overstride, visibility)
- **Export Options**: PDF generation and JSON export functionality

### 3. **Modular Design**
- **Reusable Components**: Highly modular and reusable UI components
- **Custom Hooks**: Encapsulated business logic in custom hooks
- **Utility Functions**: Centralized utility functions for formatting and validation
- **Configuration Management**: Centralized configuration and constants

## 📋 Component Documentation

### Custom Hooks

#### `useVideoUpload`
Handles video file upload and analysis processing.

**Features:**
- File validation and error handling
- Progress tracking
- API communication
- Data transformation

**Usage:**
```javascript
const { uploadVideo, isLoading, error, progress } = useVideoUpload();
```

#### `useReportData`
Processes and manages report data for display.

**Features:**
- Data validation and transformation
- Analysis section creation
- Image URL construction
- Error handling

**Usage:**
```javascript
const { processedData, analysisSections, loading, error, hasErrors } = useReportData(rawData);
```

### Components

#### `AnalysisSection`
Displays detailed analysis for specific issue types.

**Props:**
- `title`: Section title
- `description`: Issue description
- `impact`: Impact explanation
- `frameCount`: Number of problematic frames
- `totalSeconds`: Total time affected
- `worstFrameImage`: URL of worst frame image
- `worstFrameNumber`: Frame number
- `worstFrameSeverity`: Severity score
- `worstFrameDescription`: Frame description
- `issueType`: Type of issue
- `severity`: Severity level

#### `SummaryContainer`
Displays overall analysis metrics and quality assessment.

**Props:**
- `reportData`: Complete report data object

#### `ExportOptions`
Handles report export functionality (PDF and JSON).

**Props:**
- `reportData`: Report data to export

### Utility Functions

#### Formatters (`utils/formatters.js`)
- `formatTime(seconds)`: Formats time in human-readable format
- `formatPercentage(percentage, decimals)`: Formats percentage values
- `formatFileSize(bytes)`: Formats file sizes
- `formatFrameNumber(frameNumber, digits)`: Formats frame numbers
- `formatDate(date)`: Formats dates to Brazilian format
- `formatSeverityScore(score)`: Formats severity scores

#### Validators (`utils/validators.js`)
- `validateVideoFile(file)`: Validates video files
- `validateAnalysisData(data)`: Validates analysis data structure
- `validateReportData(data)`: Validates report data structure
- `isValidUrl(url)`: Validates URL format
- `isValidEmail(email)`: Validates email format
- `isValidSeverityScore(score)`: Validates severity scores

## 🔧 Configuration

### API Configuration
```javascript
export const API_CONFIG = {
  baseUrl: 'http://127.0.0.1:8000',
  endpoints: {
    analyze: '/analisar-video/',
    saveReport: '/api/save_report',
    worstFrame: '/api/worst_frame'
  },
  timeout: 30000
};
```

### Issue Type Configuration
```javascript
export const ISSUE_TYPE_CONFIG = {
  posture: {
    title: 'Problemas de Postura',
    description: '...',
    impact: '...',
    severity: 'medium',
    color: 'orange'
  },
  // ... other issue types
};
```

## 🎨 UI/UX Improvements

### Design Principles
- **Consistent Styling**: Unified design system using TailwindCSS
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Clear loading indicators and progress feedback
- **Error Handling**: User-friendly error messages and recovery options

### Visual Enhancements
- **Progress Indicators**: Real-time upload and processing progress
- **Interactive Elements**: Hover effects and smooth transitions
- **Image Display**: Optimized worst frame image display
- **Data Visualization**: Clear metrics and statistics display

## 🚀 Performance Optimizations

### Code Splitting
- Modular component structure
- Lazy loading for heavy components
- Optimized bundle sizes

### State Management
- Efficient state updates
- Memoized calculations
- Optimized re-renders

### Data Processing
- Efficient data transformation
- Cached calculations
- Optimized image loading

## 🧪 Error Handling

### Comprehensive Error Management
- **Network Errors**: Connection and timeout handling
- **Validation Errors**: Input validation with clear messages
- **API Errors**: Backend error handling and user feedback
- **File Errors**: File validation and format checking

### User Experience
- **Graceful Degradation**: Fallback options for failed operations
- **Recovery Options**: Retry mechanisms and alternative paths
- **Clear Messaging**: User-friendly error descriptions

## 📱 Responsive Design

### Mobile-First Approach
- **Touch-Friendly**: Optimized for mobile interactions
- **Adaptive Layouts**: Responsive grid systems
- **Performance**: Optimized for mobile devices

### Cross-Platform Compatibility
- **Browser Support**: Modern browser compatibility
- **Device Support**: Desktop, tablet, and mobile optimization

## 🔒 Security Considerations

### Data Protection
- **Input Sanitization**: Proper input validation and sanitization
- **File Security**: Safe file handling and validation
- **API Security**: Secure API communication

### Privacy
- **Data Storage**: Secure local storage management
- **User Data**: Minimal data collection and storage

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- React 18+

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

## 📝 Best Practices Implemented

### Code Organization
- **Separation of Concerns**: Clear separation between UI, logic, and data
- **Single Responsibility**: Each component has a single, well-defined purpose
- **DRY Principle**: Reusable components and utility functions
- **Consistent Naming**: Clear, descriptive naming conventions

### React Best Practices
- **Functional Components**: Modern React with hooks
- **Custom Hooks**: Encapsulated business logic
- **Memoization**: Optimized performance with useMemo and useCallback
- **Error Boundaries**: Proper error handling and recovery

### Performance
- **Lazy Loading**: Code splitting and lazy loading
- **Memoization**: Optimized re-renders
- **Efficient Updates**: Minimal state updates and re-renders

## 🎯 Future Enhancements

### Planned Features
- **Real-time Analysis**: Live video analysis capabilities
- **Advanced Filtering**: Enhanced report filtering and sorting
- **User Management**: User accounts and history
- **API Integration**: Enhanced backend integration

### Technical Improvements
- **Testing**: Comprehensive test coverage
- **Documentation**: Enhanced API documentation
- **Monitoring**: Performance monitoring and analytics
- **Accessibility**: Enhanced accessibility features

## 📞 Support

For questions or issues with the refactored codebase, please refer to the component documentation or contact the development team.

---

**Note**: This refactored codebase maintains all original functionality while providing significant improvements in code organization, maintainability, and user experience.
