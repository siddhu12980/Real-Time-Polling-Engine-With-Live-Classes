import React, { useState, useEffect, useRef } from 'react';
import LoadingBar from 'react-top-loading-bar';

interface TimerBarProps {
    durationInSeconds: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ durationInSeconds }) => {
    const [progress, setProgress] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const interval = 100;
        const increment = (100 / (durationInSeconds * 1000)) * interval;

     
        intervalRef.current = setInterval(() => {
            setProgress((prev) => {
                if (prev + increment >= 100) {
                    clearInterval(intervalRef.current!);
                    setProgress(100);
                }
                return prev + increment;
            });
        }, interval);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [durationInSeconds]);

    return (

        <LoadingBar

        containerStyle={{
          position: 'absolute', // Ensures it is positioned relative to the parent container
          top: 0,
          left: 0,
          width: '100%',
          height: '5px', // Customize height as needed
          zIndex: 10,
        }}

            color={` ${progress < 50 ? 'blue' : progress < 80 ? 'orange' : 'red'}`} 

            progress={progress}
            onLoaderFinished={() => setProgress(0)}
        />

    );
};

export default TimerBar;
