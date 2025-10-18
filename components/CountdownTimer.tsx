import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string;
}

const calculateTimeLeft = (targetDate: string) => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    };

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    return timeLeft;
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft(targetDate));
        }, 1000);

        return () => clearTimeout(timer);
    });

    const format = (num: number) => num.toString().padStart(2, '0');
    
    const totalHours = timeLeft.days * 24 + timeLeft.hours;

    return (
        <div className="flex items-center space-x-1 text-sm font-mono">
            <span className="bg-white/30 text-white font-bold py-1 px-2 rounded">{format(totalHours)}</span>
            <span className="text-white font-bold">:</span>
            <span className="bg-white/30 text-white font-bold py-1 px-2 rounded">{format(timeLeft.minutes)}</span>
            <span className="text-white font-bold">:</span>
            <span className="bg-white/30 text-white font-bold py-1 px-2 rounded">{format(timeLeft.seconds)}</span>
        </div>
    );
};
