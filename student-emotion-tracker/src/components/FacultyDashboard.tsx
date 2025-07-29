import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon,
  LogoutIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

interface Student {
  id: string;
  name: string;
  email: string;
  currentMood?: string;
  moodEmoji?: string;
  lastActive: Date;
  attendanceRate: number;
  moodTrend: 'improving' | 'stable' | 'declining';
}

interface Comment {
  id: string;
  studentId: string;
  facultyId: string;
  comment: string;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

interface FeedbackToAdmin {
  id: string;
  studentId: string;
  studentName: string;
  concern: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  facultyId: string;
}

const FacultyDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [comment, setComment] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [feedback, setFeedback] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [searchTerm, setSearchTerm] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackToAdmin[]>([]);

  useEffect(() => {
    // Mock student data - in real app, this would come from API
    const mockStudents: Student[] = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@student.edu',
        currentMood: 'Happy',
        moodEmoji: '😊',
        lastActive: new Date(),
        attendanceRate: 95,
        moodTrend: 'stable'
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@student.edu',
        currentMood: 'Anxious',
        moodEmoji: '😰',
        lastActive: new Date(Date.now() - 3600000), // 1 hour ago
        attendanceRate: 78,
        moodTrend: 'declining'
      },
      {
        id: '3',
        name: 'Carol Davis',
        email: 'carol@student.edu',
        currentMood: 'Excited',
        moodEmoji: '🤗',
        lastActive: new Date(Date.now() - 1800000), // 30 min ago
        attendanceRate: 88,
        moodTrend: 'improving'
      },
      {
        id: '4',
        name: 'David Wilson',
        email: 'david@student.edu',
        currentMood: 'Tired',
        moodEmoji: '😴',
        lastActive: new Date(Date.now() - 7200000), // 2 hours ago
        attendanceRate: 65,
        moodTrend: 'declining'
      },
    ];

    setStudents(mockStudents);

    // Load saved comments and feedback
    const savedComments = localStorage.getItem(`faculty_comments_${currentUser?.uid}`);
    const savedFeedback = localStorage.getItem(`faculty_feedback_${currentUser?.uid}`);
    
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
    
    if (savedFeedback) {
      setFeedbackHistory(JSON.parse(savedFeedback));
    }
  }, [currentUser]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddComment = () => {
    if (!selectedStudent || !comment.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      facultyId: currentUser?.uid || '',
      comment: comment.trim(),
      timestamp: new Date(),
      priority
    };

    const updatedComments = [newComment, ...comments];
    setComments(updatedComments);
    localStorage.setItem(`faculty_comments_${currentUser?.uid}`, JSON.stringify(updatedComments));
    
    setComment('');
    setPriority('low');
  };

  const handleSendFeedback = () => {
    if (!selectedStudent || !feedback.trim()) return;

    const newFeedback: FeedbackToAdmin = {
      id: Date.now().toString(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      concern: feedback.trim(),
      severity,
      timestamp: new Date(),
      facultyId: currentUser?.uid || ''
    };

    const updatedFeedback = [newFeedback, ...feedbackHistory];
    setFeedbackHistory(updatedFeedback);
    localStorage.setItem(`faculty_feedback_${currentUser?.uid}`, JSON.stringify(updatedFeedback));
    
    setFeedback('');
    setSeverity('low');
  };

  const getStudentComments = (studentId: string) => {
    return comments.filter(comment => comment.studentId === studentId);
  };

  const getMoodTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      <div className="absolute inset-0 glitter-dots opacity-20"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Faculty Dashboard 👨‍🏫
            </h1>
            <p className="text-white/70">Monitor student wellbeing and engagement</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-white transition-colors duration-200"
          >
            <LogoutIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 glass-effect rounded-2xl p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <UserGroupIcon className="h-8 w-8 mr-2" />
                Students Overview
              </h2>
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-glitter-gold"
                />
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredStudents.map((student) => (
                <motion.div
                  key={student.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedStudent?.id === student.id
                      ? 'border-glitter-gold bg-white/20'
                      : 'border-white/20 hover:border-white/40 bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">{student.moodEmoji}</div>
                      <div>
                        <h3 className="text-white font-semibold">{student.name}</h3>
                        <p className="text-white/60 text-sm">{student.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-white/80 text-sm">
                            Mood: <span className="text-yellow-400">{student.currentMood}</span>
                          </span>
                          <span className={`text-sm ${getMoodTrendColor(student.moodTrend)}`}>
                            {getMoodTrendIcon(student.moodTrend)} {student.moodTrend}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        student.attendanceRate >= 90 ? 'text-green-400' :
                        student.attendanceRate >= 75 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {student.attendanceRate}% Attendance
                      </div>
                      <div className="text-white/60 text-xs mt-1">
                        Last active: {new Date(student.lastActive).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Student Details & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {selectedStudent ? (
              <>
                {/* Student Details */}
                <div className="glass-effect rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {selectedStudent.name}
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Current Mood:</span>
                      <span className="text-yellow-400">
                        {selectedStudent.moodEmoji} {selectedStudent.currentMood}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Attendance:</span>
                      <span className={`font-semibold ${
                        selectedStudent.attendanceRate >= 90 ? 'text-green-400' :
                        selectedStudent.attendanceRate >= 75 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {selectedStudent.attendanceRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Trend:</span>
                      <span className={getMoodTrendColor(selectedStudent.moodTrend)}>
                        {getMoodTrendIcon(selectedStudent.moodTrend)} {selectedStudent.moodTrend}
                      </span>
                    </div>
                  </div>

                  {/* Previous Comments */}
                  <div className="mt-6">
                    <h4 className="text-white font-semibold mb-3">Previous Comments</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {getStudentComments(selectedStudent.id).slice(0, 3).map((comment) => (
                        <div key={comment.id} className="bg-white/5 rounded p-2">
                          <p className="text-white/80 text-sm">{comment.comment}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className={`text-xs px-2 py-1 rounded ${
                              comment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              comment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {comment.priority}
                            </span>
                            <span className="text-white/50 text-xs">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add Comment */}
                <div className="glass-effect rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
                    Add Comment
                  </h3>
                  
                  <div className="space-y-4">
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment about this student..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-glitter-gold resize-none"
                      rows={3}
                    />
                    
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-glitter-gold"
                    >
                      <option value="low" className="bg-gray-800">Low Priority</option>
                      <option value="medium" className="bg-gray-800">Medium Priority</option>
                      <option value="high" className="bg-gray-800">High Priority</option>
                    </select>
                    
                    <button
                      onClick={handleAddComment}
                      disabled={!comment.trim()}
                      className="w-full py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>

                {/* Send Feedback to Admin */}
                <div className="glass-effect rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                    Alert Admin
                  </h3>
                  
                  <div className="space-y-4">
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Describe the concern or issue..."
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-glitter-gold resize-none"
                      rows={3}
                    />
                    
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as 'low' | 'medium' | 'high' | 'critical')}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-glitter-gold"
                    >
                      <option value="low" className="bg-gray-800">Low Severity</option>
                      <option value="medium" className="bg-gray-800">Medium Severity</option>
                      <option value="high" className="bg-gray-800">High Severity</option>
                      <option value="critical" className="bg-gray-800">Critical</option>
                    </select>
                    
                    <button
                      onClick={handleSendFeedback}
                      disabled={!feedback.trim()}
                      className="w-full py-2 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Send to Admin
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass-effect rounded-2xl p-6 text-center">
                <UserGroupIcon className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">Select a student to view details and add comments</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;