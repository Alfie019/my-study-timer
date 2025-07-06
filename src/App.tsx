import {useState, useEffect, useCallback } from 'react';

// Constants for timer duration in seconds

const WORK_DURATION = 20 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 Minutes
const SESSIONS_UNTIL_LONG_BREAK = 4;

// TypeScript type for Timer Modes

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

// Main App Component

export default function App() {

  // State Management using React Hooks 

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeRemaining, setTimeRemaining] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Audio for timer completion

  const playSound = useCallback(() => {
    if ((window as any).Tone) {
      const synth = new (window as any).Tone.Synth().toDestination();
      synth.triggerAttackRelease("C5", "8n");
    }
  }, []);

  // Function to switch modes

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode (newMode);
    switch (newMode) {
      case 'work':
        setTimeRemaining(WORK_DURATION);
        break;
      case 'shortBreak':
        setTimeRemaining(SHORT_BREAK_DURATION);
        break;
      case 'longBreak':
        setTimeRemaining(LONG_BREAK_DURATION);
        break;
    }
  }, []);

  // Core Timer Logic using useEffect

  useEffect(() => {
    let interval: number | undefined = undefined;
    
    if (isActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      playSound();
      setIsActive(false);

      // Automatically switch to the next mode

      if (mode === 'work') {
        const newSessionCount = sessionsCompleted + 1;
        setSessionsCompleted(newSessionCount);
        if (newSessionCount % SESSIONS_UNTIL_LONG_BREAK === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        switchMode('work');
      }
    }

    // Cleanup function 
     
    return () => clearInterval(interval);
    }, [isActive, timeRemaining, mode, sessionsCompleted, playSound, switchMode]);

    // Event Handler

    const handleToggle = () => {
      setIsActive(!isActive);
    };

    const handleReset = () => {
      setIsActive(false);
      switchMode(mode);
    };

    // Helper function to Format Time 

    const formatTime = (seconds: number): string => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Dynamic styling based on Mode 

    const getThemeClasses = () => {
      switch (mode) {
        case 'work' : 
          return 'from-red-500 to-orange-500';
        case 'shortBreak':
          return 'from-blue-400 to-teal-400'
        case 'longBreak':
          return 'from-green-400 to-emerald-500'
      }
    };

    const getButtonClasses = () => {
      switch (mode) {
        case 'work' : 
          return 'bg-red-600 hover:bg-red-700';
        case 'shortBreak':
          return 'bg-blue-500 hover:bg-blue-600';
        case 'longBreak':
          return 'bg-green-500 hover:bg-green-600';
      }
    };

    return (
      <>
        {/* Load Tone.js from a CDN*/}
        <script src = "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js"></script>

        <div className = {`min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white font-sans transition-all duration-500 p-4 bg-gradient-to-br ${getThemeClasses()}`}>
          <div className="bg-black bg-opacity-30 backdrop-blur-lg p-6 sm:p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md mx-auto border border-white/20">
            
            {/* Mode Selection Buttons */}
            <div className="flex justify-center space-x-2 sm:space-x-4 mb-8">
              <button onClick={() => switchMode('work')} className={`px-4 py-2 rounded-full text-sm:text-base font-semibold transition-all duration-300 ${mode === 'work' ? 'bg-white text-black' :  'bg-white/10 hover:bg-white/20'}`}>Work</button>
              <button onClick={() => switchMode('shortBreak')} className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${mode== 'shortBreak' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Short Break</button>
              <button onClick={() => switchMode('longBreak')} className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ${mode== 'longBreak' ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>Long Break</button>
          </div>

          {/* Timer Display*/}
          <div className ="text-center mb-8">
            <p className ="text-7xl sm:text-8xl md:text-9xl font-bold tracking-tighter tabular-nums">
              {formatTime(timeRemaining)}
            </p>
          </div>

          {/* Control Buttons */}
          <div className = 'flex flex-col sm:flex-row items-center justify-center gap-4'>
            <button
              onClick={handleToggle}
              className={`w-full sm:w-48 text-2xl font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${getButtonClasses()}`}
            >
              {isActive ? 'PAUSE' : 'START'}
            </button>
            <button
              onClick={handleReset}
              className="w-24 text-lg font-semibold py-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
              >
                Reset
              </button>
          </div>

          {/* Session Counter */}
          <div className ="text-center mt-8 text-white/70">
            <p className="text-lg font-medium">Completed Sessions: {sessionsCompleted}</p>
            <p className="text-sm">Finish {SESSIONS_UNTIL_LONG_BREAK} sessions for a long break.</p>
          </div>

        </div>
      </div>
    </>
  );
}