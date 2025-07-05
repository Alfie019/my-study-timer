import React, {useState, useEffect, useCallback } from 'react';

// Constants for timer duration in seconds

const WORK_DURATION = 25 * 60; // 25 minutes
const SHORT_BREAK_DURATION = 5 * 60; // 5 minutes
const LONG_BREAK_DURATION = 15 * 60; // 15 Minutes
const SESSIONS_UNTIL_LONG_BREAK = 4;

// TypeScript type for Timer Modes

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

// Main App Component

export default function App() {

  // State Managment using React Hooks 

  const [mode, setMode] = useState<TimerMode>('work');
  const [timeRemaning, setTimeRemaning] = useState(WORK_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);

  // Audio for timer completion

  const playSound = useCallback(() => {
    const synth = new (window as any).Tone.Synth().toDestination();
    synth.triggerAttackRelease("C5", "8n");
  }, []);

  // Function to switch modes

  const switchMode = useCallback((newMode: TimerMode) => {
    setIsActive(false);
    setMode (newMode);
    switch (newMode) {
      case 'work':
        setTimeRemaning(WORK_DURATION);
        break;
      case 'shortBreak':
        setTimeRemaning(SHORT_BREAK_DURATION);
        break;
      case 'longBreak':
        setTimeRemaning(LONG_BREAK_DURATION);
        break;
    }
  }, []);

  // Core Timer Logic using useEffect

  useEffect(() => {
    let interval: undefined = undefined;
    
    if (isActive && timeRemaning > 0) {
      interval = setInterval(() => {
        setTimeRemaning(prevTime => prevTime);
      }, 1000);
    } else if (timeRemaning === 0) {
      playSound();
      setIsActive(false);

      // Automattically switch to the next mode

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
    }, [isActive, timeRemaning, mode, sessionsCompleted, playSound, switchMode]);

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
  



}
