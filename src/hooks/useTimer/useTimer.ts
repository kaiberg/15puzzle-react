import React from "react";

function useTimer(intervalMS = 1000, initialPaused = false) : {time: number, paused: boolean, setPaused: (value: boolean) => void} {
    const [time, setTime] = React.useState(0);
    const [paused, setPause] = React.useState(initialPaused);
    // const [antiPattern, setAntiPattern] = React.useState(false);

    // React.useEffect(() => setAntiPattern(true), [])

    React.useEffect(() => {
        if(paused) return;
        let id = setInterval(() => setTime((t) => t+1), intervalMS)
        return () => clearInterval(id);
    }, [paused, intervalMS])

    return {time, paused, setPaused: (value: boolean) => setPause(value)}
}

export default useTimer;