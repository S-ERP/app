import { useRef, useEffect } from 'react';

const useLimitedFPS = (callback, fps) => {
    const frameRef = useRef(0);
    const lastFrameTime = useRef(Date.now());
    const fpsInterval = 1000 / fps;

    useEffect(() => {
        const loop = () => {
            frameRef.current = requestAnimationFrame(loop);

            const now = Date.now();
            const elapsed = now - lastFrameTime.current;

            if (elapsed > fpsInterval) {
                lastFrameTime.current = now - (elapsed % fpsInterval);
                callback();
            }
        };

        frameRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(frameRef.current);
    }, [callback, fps]);
};

export default useLimitedFPS;
