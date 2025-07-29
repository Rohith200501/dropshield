const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/emotracker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

// Emotion Detection Schema
const emotionSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    required: true,
    enum: ['happy', 'sad', 'angry', 'fearful', 'disgusted', 'surprised', 'neutral']
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  imageData: {
    type: String, // Base64 encoded image
    required: false
  },
  location: {
    type: String,
    default: 'classroom'
  }
});

const Emotion = mongoose.model('Emotion', emotionSchema);

// Student Schema
const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  currentMood: {
    type: String,
    default: 'neutral'
  },
  moodHistory: [{
    mood: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  attendanceHistory: [{
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['present', 'late', 'absent'] }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Student = mongoose.model('Student', studentSchema);

// Faculty Alert Schema
const alertSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  facultyId: {
    type: String,
    required: true
  },
  concern: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Alert = mongoose.model('Alert', alertSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'EmoTracker API is running' });
});

// Save emotion detection
app.post('/api/emotions', async (req, res) => {
  try {
    const { studentId, studentName, emotion, confidence, imageData } = req.body;
    
    const newEmotion = new Emotion({
      studentId,
      studentName,
      emotion,
      confidence,
      imageData,
      timestamp: new Date()
    });

    await newEmotion.save();
    
    // Update student's current mood
    await Student.findOneAndUpdate(
      { studentId },
      { 
        currentMood: emotion,
        $push: {
          moodHistory: {
            mood: emotion,
            timestamp: new Date()
          }
        }
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ 
      success: true, 
      message: 'Emotion data saved successfully',
      data: newEmotion 
    });
  } catch (error) {
    console.error('Error saving emotion data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save emotion data',
      error: error.message 
    });
  }
});

// Get emotion history for a student
app.get('/api/emotions/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 50, startDate, endDate } = req.query;

    let query = { studentId };
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const emotions = await Emotion.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: emotions,
      count: emotions.length
    });
  } catch (error) {
    console.error('Error fetching emotion data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch emotion data',
      error: error.message 
    });
  }
});

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().select('-moodHistory -attendanceHistory');
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch students',
      error: error.message 
    });
  }
});

// Create or update student
app.post('/api/students', async (req, res) => {
  try {
    const { studentId, name, email } = req.body;
    
    const student = await Student.findOneAndUpdate(
      { studentId },
      { studentId, name, email },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error('Error creating/updating student:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create/update student',
      error: error.message 
    });
  }
});

// Save faculty alert
app.post('/api/alerts', async (req, res) => {
  try {
    const { studentId, studentName, facultyId, concern, severity } = req.body;
    
    const alert = new Alert({
      studentId,
      studentName,
      facultyId,
      concern,
      severity,
      timestamp: new Date()
    });

    await alert.save();

    res.status(201).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error saving alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save alert',
      error: error.message 
    });
  }
});

// Get alerts for admin
app.get('/api/alerts', async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const alerts = await Alert.find({ status })
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch alerts',
      error: error.message 
    });
  }
});

// Update alert status
app.patch('/api/alerts/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { status } = req.body;
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { status },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update alert',
      error: error.message 
    });
  }
});

// Get emotion analytics
app.get('/api/analytics/emotions', async (req, res) => {
  try {
    const { startDate, endDate, studentId } = req.query;
    
    let matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    if (studentId) matchStage.studentId = studentId;

    const analytics = await Emotion.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$emotion',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidence' },
          students: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          emotion: '$_id',
          count: 1,
          avgConfidence: { $round: ['$avgConfidence', 3] },
          uniqueStudents: { $size: '$students' },
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();