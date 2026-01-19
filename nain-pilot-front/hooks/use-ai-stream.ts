import { useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from './use-socket';

export const useAIStream = () => {
    const { socket, isConnected } = useSocket();
    const [streaming, setStreaming] = useState(false);
    const [currentResponse, setCurrentResponse] = useState('');
    
    const responseAccumulator = useRef('');

    useEffect(() => {
        if (!socket) return;

        const handleStreamText = (text: string) => {
            setStreaming(true);
            responseAccumulator.current += text;
            setCurrentResponse(responseAccumulator.current);
        };

        const handleStreamFinish = () => {
            setStreaming(false);
            console.log('Stream finished. Respuesta original:', responseAccumulator.current);
        };

        const handleError = (error: any) => {
            console.error('AI Stream Error:', error);
            setStreaming(false);
        };

        socket.on('stream-text', handleStreamText);
        socket.on('stream-finish', handleStreamFinish);
        socket.on('error', handleError);

        return () => {
            socket.off('stream-text', handleStreamText);
            socket.off('stream-finish', handleStreamFinish);
            socket.off('error', handleError);
        };
    }, [socket]);

    const generate = useCallback((prompt: string) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected');
            return;
        }

        setStreaming(true);
        responseAccumulator.current = '';
        setCurrentResponse('');
        socket.emit('process-query', { prompt });
    }, [socket, isConnected]);

    return { generate, streaming, currentResponse, isConnected };
};
