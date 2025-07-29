import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import * as faceapi from 'face-api.js';
import {
  VideoCameraIcon,
  StopIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LogoutIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface EmotionDetection {
  id: string;
  studentId: string;
  studentName: string;
  emotion: string;
  confidence: number;
  timestamp: Date;
  imageData?: string;
}

interface FacultyAlert {
  id: string;
  studentId: string;
  studentName: string;
  concern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  facultyId: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

const AdminPanel: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [emotionConfidence, setEmotionConfidence] = useState<number>(0);
  const [emotionHistory, setEmotionHistory] = useState<EmotionDetection[]>([]);
  const [facultyAlerts, setFacultyAlerts] = useState<FacultyAlert[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  // Mock student list
  const students = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Carol Davis' },
    { id: '4', name: 'David Wilson' },
  ];

  useEffect(() => {
    loadModels();
    loadFacultyAlerts();
    loadEmotionHistory();
  }, []);

  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'; // You'd need to serve the face-api.js models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);
      setIsModelLoaded(true);
    } catch (error) {
      console.error('Error loading face-api models:', error);
      // For demo purposes, we'll simulate model loading
      setTimeout(() => setIsModelLoaded(true), 2000);
    }
  };

  const loadFacultyAlerts = () => {
    const alerts = localStorage.getItem('admin_faculty_alerts');
    if (alerts) {
      setFacultyAlerts(JSON.parse(alerts));
    } else {
      // Mock alerts for demo
      const mockAlerts: FacultyAlert[] = [
        {
          id: '1',
          studentId: '2',
          studentName: 'Bob Smith',
          concern: 'Student showing signs of anxiety during classes',
          severity: 'high',
          timestamp: new Date(Date.now() - 3600000),
          facultyId: 'faculty1',
          status: 'pending'
        },
        {
          id: '2',
          studentId: '4',
          studentName: 'David Wilson',
          concern: 'Declining attendance and participation',
          severity: 'medium',
          timestamp: new Date(Date.now() - 7200000),
          facultyId: 'faculty1',
          status: 'pending'
        }
      ];
      setFacultyAlerts(mockAlerts);
    }
  };

  const loadEmotionHistory = () => {
    const history = localStorage.getItem('admin_emotion_history');
    if (history) {
      setEmotionHistory(JSON.parse(history));
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        
        videoRef.current.addEventListener('loadedmetadata', () => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        });
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsDetecting(false);
  };

  const startEmotionDetection = async () => {
    if (!isModelLoaded || !videoRef.current || !selectedStudent) {
      alert('Please ensure models are loaded, camera is active, and a student is selected.');
      return;
    }

    setIsDetecting(true);
    detectEmotions();
  };

  const detectEmotions = async () => {
    if (!videoRef.current || !canvasRef.current || !isDetecting) return;

    try {
      // For demo purposes, we'll simulate emotion detection
      // In real implementation, you'd use:
      // const detections = await faceapi.detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      //   .withFaceLandmarks()
      //   .withFaceExpressions();

      // Simulated emotion detection
      const emotions = ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral'];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      const confidence = Math.random() * 0.4 + 0.6; // 0.6 to 1.0

      setCurrentEmotion(randomEmotion);
      setEmotionConfidence(confidence);

      // Save detection to history
      if (selectedStudent && confidence > 0.7) {
        const student = students.find(s => s.id === selectedStudent);
        const detection: EmotionDetection = {
          id: Date.now().toString(),
          studentId: selectedStudent,
          studentName: student?.name || 'Unknown',
          emotion: randomEmotion,
          confidence,
          timestamp: new Date(),
        };

        const updatedHistory = [detection, ...emotionHistory].slice(0, 50);
        setEmotionHistory(updatedHistory);
        localStorage.setItem('admin_emotion_history', JSON.stringify(updatedHistory));
      }

      // Continue detection
      setTimeout(detectEmotions, 1000);
    } catch (error) {
      console.error('Error detecting emotions:', error);
    }
  };

  const stopEmotionDetection = () => {
    setIsDetecting(false);
    setCurrentEmotion(null);
    setEmotionConfidence(0);
  };

  const handleAlertStatusChange = (alertId: string, newStatus: 'pending' | 'reviewed' | 'resolved') => {
    const updatedAlerts = facultyAlerts.map(alert =>
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    );
    setFacultyAlerts(updatedAlerts);
    localStorage.setItem('admin_faculty_alerts', JSON.stringify(updatedAlerts));
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      happy: 'text-green-400',
      sad: 'text-blue-400',
      angry: 'text-red-400',
      fearful: 'text-purple-400',
      disgusted: 'text-yellow-600',
      surprised: 'text-yellow-400',
      neutral: 'text-gray-400'
    };
    return colors[emotion] || 'text-white';
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      happy: '😊',
      sad: '😢',
      angry: '😡',
      fearful: '😨',
      disgusted: '🤢',
      surprised: '😲',
      neutral: '😐'
    };
    return emojis[emotion] || '🤔';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-green-500/20 text-green-400 border-green-500/50';
    }
  };

  const handleLogout = async () => {
    try {
      stopCamera();
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden">
      <div className="absolute inset-0 glitter-dots opacity-10"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Panel 👨‍💼
            </h1>
            <p className="text-white/70">Live emotion monitoring and system oversight</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-white transition-colors duration-200"
          >
            <LogoutIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Live Emotion Detection */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-2 glass-effect rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <VideoCameraIcon className="h-8 w-8 mr-2" />
              Live Emotion Detection
            </h2>

            <div className="space-y-6">
              {/* Camera Feed */}
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                  style={{ display: isCameraActive ? 'block' : 'none' }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0"
                  style={{ display: 'none' }}
                />
                {!isCameraActive && (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-800">
                    <div className="text-center">
                      <VideoCameraIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Camera not active</p>
                    </div>
                  </div>
                )}
                
                {/* Emotion Overlay */}
                {currentEmotion && isDetecting && (
                  <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3">
                    <div className="text-center">
                      <div className="text-3xl mb-1">{getEmotionEmoji(currentEmotion)}</div>
                      <div className={`font-semibold ${getEmotionColor(currentEmotion)}`}>
                        {currentEmotion}
                      </div>
                      <div className="text-white/60 text-sm">
                        {(emotionConfidence * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Select Student</label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-glitter-gold"
                  >
                    <option value="" className="bg-gray-800">Select a student...</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id} className="bg-gray-800">
                        {student.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  {!isCameraActive ? (
                    <button
                      onClick={startCamera}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors duration-200"
                    >
                      <VideoCameraIcon className="h-5 w-5" />
                      <span>Start Camera</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors duration-200"
                    >
                      <StopIcon className="h-5 w-5" />
                      <span>Stop Camera</span>
                    </button>
                  )}

                  {isModelLoaded && isCameraActive && selectedStudent && (
                    !isDetecting ? (
                      <button
                        onClick={startEmotionDetection}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors duration-200"
                      >
                        <ChartBarIcon className="h-5 w-5" />
                        <span>Start Detection</span>
                      </button>
                    ) : (
                      <button
                        onClick={stopEmotionDetection}
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-orange-400 transition-colors duration-200"
                      >
                        <StopIcon className="h-5 w-5" />
                        <span>Stop Detection</span>
                      </button>
                    )
                  )}
                </div>

                {!isModelLoaded && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-white/60 text-sm">Loading AI models...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Alerts and Data */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Faculty Alerts */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                Faculty Alerts
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {facultyAlerts.filter(alert => alert.status === 'pending').map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">{alert.studentName}</h4>
                      <span className="text-xs px-2 py-1 rounded bg-white/10">
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-sm opacity-90 mb-2">{alert.concern}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs opacity-70">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <div className="space-x-2">
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'reviewed')}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors duration-200"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => handleAlertStatusChange(alert.id, 'resolved')}
                          className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors duration-200"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotion History */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2" />
                Recent Detections
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {emotionHistory.slice(0, 10).map((detection) => (
                  <div
                    key={detection.id}
                    className="p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{getEmotionEmoji(detection.emotion)}</span>
                        <div>
                          <p className="text-white font-medium text-sm">{detection.studentName}</p>
                          <p className={`text-xs ${getEmotionColor(detection.emotion)}`}>
                            {detection.emotion} ({(detection.confidence * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <span className="text-white/60 text-xs">
                        {new Date(detection.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;