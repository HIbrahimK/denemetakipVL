'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { studySessionsApi } from '@/lib/api/study';

export function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60); // 25 dakika
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    } else if (time === 0) {
      handleComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, time]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(mode === 'work' ? 25 * 60 : 5 * 60);
    setStartTime(null);
  };

  const handleComplete = async () => {
    if (mode === 'work' && startTime) {
      // Çalışma seansını kaydet
      try {
        await studySessionsApi.log({
          duration: 25 * 60, // saniye cinsinden
          startTime: startTime.toISOString(),
          endTime: new Date().toISOString(),
          isPomodoroMode: true,
        });
      } catch (error) {
        console.error('Session log failed:', error);
      }
    }

    // Modu değiştir
    const newMode = mode === 'work' ? 'break' : 'work';
    setMode(newMode);
    setTime(newMode === 'work' ? 25 * 60 : 5 * 60);
    setIsRunning(false);
    setStartTime(null);

    // Bildirim
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        mode === 'work' ? 'Mola zamanı!' : 'Çalışma zamanı!',
        {
          body: mode === 'work' ? '5 dakika mola ver.' : '25 dakika çalışma başlat.',
        }
      );
    }
  };

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pomodoro Zamanlayıcı</CardTitle>
        <CardDescription>
          {mode === 'work' ? '25 dakika çalış' : '5 dakika mola'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-6xl font-bold ${mode === 'work' ? 'text-blue-600' : 'text-green-600'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="flex justify-center gap-2">
          {!isRunning ? (
            <Button onClick={handleStart} size="lg">
              <Play className="mr-2 h-4 w-4" />
              Başlat
            </Button>
          ) : (
            <Button onClick={handlePause} size="lg" variant="outline">
              <Pause className="mr-2 h-4 w-4" />
              Duraklat
            </Button>
          )}
          <Button onClick={handleReset} size="lg" variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${mode === 'work' ? 'bg-blue-600' : 'bg-green-600'}`}
            style={{
              width: `${((mode === 'work' ? 25 * 60 : 5 * 60) - time) / (mode === 'work' ? 25 * 60 : 5 * 60) * 100}%`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
