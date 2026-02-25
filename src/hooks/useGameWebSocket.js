import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useGameWebSocket = (gameCode, onEvent) => {
    const stompClientRef = useRef(null);

    useEffect(() => {
        if (!gameCode) return;

        const WS_URL = import.meta.env.VITE_WS_URL || '/ws';
        const socket = new SockJS(WS_URL);
        const stompClient = Stomp.over(socket);

        stompClient.debug = () => { };

        stompClient.connect({}, () => {
            console.log(`Connected to WebSocket for game: ${gameCode}`);

            const subscription = stompClient.subscribe(`/topic/game/${gameCode}`, (message) => {
                if (message.body) {
                    try {
                        const event = JSON.parse(message.body);
                        onEvent(event);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                }
            });

            stompClientRef.current = {
                client: stompClient,
                subscription: subscription
            };
        }, (error) => {
            console.error('WebSocket connection error:', error);
        });

        return () => {
            if (stompClientRef.current) {
                console.log('Disconnecting WebSocket...');
                stompClientRef.current.subscription.unsubscribe();
                stompClientRef.current.client.disconnect();
            }
        };
    }, [gameCode, onEvent]);

    return stompClientRef.current;
};
