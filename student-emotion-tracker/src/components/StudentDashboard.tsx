import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { CalendarIcon, ClockIcon, LogoutIcon } from '@heroicons/react/24/outline';

interface MoodEntry {
  id: string;
  emoji: string;
  mood: string;
  timestamp: Date;
  notes?: string;
}

interface AttendanceEntry {
  id: string;
  timestamp: Date;
  status: 'present' | 'late';
}

const StudentDashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [selectedMood, setSelectedMood] = useState('');
  const [moodNotes, setMoodNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceEntry[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceEntry | null>(null);

  const moods = [
    { emoji: '😊', name: 'Happy', color: 'text-yellow-400' },
    { emoji: '😢', name: 'Sad', color: 'text-blue-400' },
    { emoji: '😡', name: 'Angry', color: 'text-red-400' },
    { emoji: '😰', name: 'Anxious', color: 'text-purple-400' },
    { emoji: '😴', name: 'Tired', color: 'text-gray-400' },
    { emoji: '🤗', name: 'Excited', color: 'text-green-400' },
    { emoji: '😕', name: 'Confused', color: 'text-orange-400' },
    { emoji: '😌', name: 'Calm', color: 'text-blue-300' },
  ];

  useEffect(() => {
    // Load data from localStorage
    const savedMoods = localStorage.getItem(`moods_${currentUser?.uid}`);
    const savedAttendance = localStorage.getItem(`attendance_${currentUser?.uid}`);
    
    if (savedMoods) {
      setMoodHistory(JSON.parse(savedMoods));
    }
    
    if (savedAttendance) {
      const attendance = JSON.parse(savedAttendance);
      setAttendanceHistory(attendance);
      
      // Check if already marked attendance today
      const today = new Date().toDateString();
      const todayEntry = attendance.find((entry: AttendanceEntry) => 
        new Date(entry.timestamp).toDateString() === today
      );
      setTodayAttendance(todayEntry || null);
    }
  }, [currentUser]);

  const handleMoodSubmit = () => {
    if (!selectedMood) return;

    const newMood: MoodEntry = {
      id: Date.now().toString(),
      emoji: moods.find(m => m.name === selectedMood)?.emoji || '😊',
      mood: selectedMood,
      timestamp: new Date(),
      notes: moodNotes,
    };

    const updatedHistory = [newMood, ...moodHistory].slice(0, 10); // Keep last 10 entries
    setMoodHistory(updatedHistory);
    localStorage.setItem(`moods_${currentUser?.uid}`, JSON.stringify(updatedHistory));
    
    setSelectedMood('');
    setMoodNotes('');
  };

  const markAttendance = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const status = currentHour > 9 ? 'late' : 'present'; // Late if after 9 AM

    const newAttendance: AttendanceEntry = {
      id: Date.now().toString(),
      timestamp: now,
      status,
    };

    const updatedAttendance = [newAttendance, ...attendanceHistory];
    setAttendanceHistory(updatedAttendance);
    setTodayAttendance(newAttendance);
    localStorage.setItem(`attendance_${currentUser?.uid}`, JSON.stringify(updatedAttendance));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Particles background */}
      <div className="absolute inset-0 glitter-dots opacity-30"></div>
      
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {currentUser?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-white/70">How are you feeling today?</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-white transition-colors duration-200"
          >
            <LogoutIcon className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Tracker */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              😊 Mood Tracker
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-white/80 mb-4">How are you feeling right now?</p>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map((mood) => (
                    <motion.button
                      key={mood.name}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedMood(mood.name)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                        selectedMood === mood.name
                          ? 'border-glitter-gold bg-white/20'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      <div className="text-3xl mb-1">{mood.emoji}</div>
                      <div className={`text-xs ${mood.color}`}>{mood.name}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="Tell us more about how you're feeling..."
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-glitter-gold resize-none"
                  rows={3}
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMoodSubmit}
                disabled={!selectedMood}
                className="w-full py-3 bg-gradient-to-r from-glitter-gold to-glitter-pink rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Log Mood 📝
              </motion.button>
            </div>
          </motion.div>

          {/* Attendance */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              📋 Attendance
            </h2>
            
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-white/80 mb-4">
                  {todayAttendance ? (
                    <span className="text-green-400">
                      ✅ Attendance marked for today
                    </span>
                  ) : (
                    'Mark your attendance for today'
                  )}
                </p>
                
                {!todayAttendance && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={markAttendance}
                    className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CalendarIcon className="h-6 w-6 inline mr-2" />
                    Mark Present
                  </motion.button>
                )}
              </div>

              {attendanceHistory.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3">Recent Attendance</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {attendanceHistory.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                      >
                        <span className="text-white/80">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'present'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {entry.status === 'present' ? 'On Time' : 'Late'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Mood History */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 glass-effect rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            📈 Mood History
          </h2>
          
          {moodHistory.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {moodHistory.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 rounded-lg p-4 border border-white/10"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div>
                      <p className="text-white font-semibold">{entry.mood}</p>
                      <p className="text-white/60 text-xs flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-white/70 text-sm mt-2">{entry.notes}</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-white/60">No mood entries yet. Start tracking your mood above!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;