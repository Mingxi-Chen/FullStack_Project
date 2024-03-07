import React from 'react';
import axios from 'axios';
export default function Logout({ setActivePage1 ,setIsLoggedIn,isLoggedIn}) {
    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/logout', {}, { withCredentials: true });
            console.log(response.data.message);
            // Handle successful logout (e.g., redirect to login page, update UI state)
            setActivePage1('Welcome');
            setIsLoggedIn(false);
        } catch (error) {
            console.error('Logout error', error);
            // Handle errors
            if (!error.response) {
                // Network or server down error
                alert('Cannot connect to the server. Please try again later.');
            } else {
                // Other errors
                alert('Error during logout. Please try again.');
            }
        }
    };

    const handleLogin = async () => {
        setActivePage1('Login');
    };


   

    return (
        <>
            {isLoggedIn ? (
                <button onClick={handleLogout}>Logout</button>
            ) : (
                <button onClick={handleLogin}>Login</button>
            )}
        </>
    );
  }