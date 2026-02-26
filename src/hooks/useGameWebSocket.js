import { useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

export const useGameWebSocket = (gameCode, onEvent) => {
    const stompClientRef = useRef(null);
    const onEventRef = useRef(onEvent);

    // Keep onEventRef updated with the latest callback
    useEffect(() => {
        onEventRef.current = onEvent;
    }, [onEvent]);

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
                        if (onEventRef.current) {
                            onEventRef.current(event);
                        }
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
                if (stompClientRef.current.subscription) {
                    stompClientRef.current.subscription.unsubscribe();
                }
                if (stompClientRef.current.client) {
                    stompClientRef.current.client.disconnect();
                }
                stompClientRef.current = null;
            }
        };
    }, [gameCode]);

    return stompClientRef.current;
};
