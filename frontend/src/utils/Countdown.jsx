import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import axios from 'axios';

const Countdown = (initialTime) => {
    const [time, setTime] = useState(initialTime);
    const navigate = useNavigate();
    
    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prevTime => {
                if (prevTime > 0) {
                    // Update the server with the remaining time each second
                    axios.put('/api/auth/update-time', { time: prevTime - 1 })
                        .then(response => {
                            console.log('AgentTimeRemaining:', response.data.user.time);
                        })
                        .catch(error => {
                            console.error('AgentTimeError:', error);
                        });
                    return prevTime - 1; // Decrement the time every second
                } else {
                    clearInterval(interval);
                    navigate('/ipstore');
                    return 0; // Stop the interval when time reaches 0
                }
            });
        }, 1000); // Update every 1000 milliseconds (1 second)

        return () => clearInterval(interval);
    }, []);

    return [time, setTime];
};

export default Countdown;