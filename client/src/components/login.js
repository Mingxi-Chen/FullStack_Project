import React, { useState } from 'react';
import axios from 'axios';

export default function Login({setAdmin,setActivePage1,setReputation,setIsLoggedIn,setUsername}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/login', { email, password },{ withCredentials: true });
            if (response.data) {

                console.log('Logged in successfully');
                setIsLoggedIn(true);
                setReputation(response.data.reputation);
                setActivePage1('Home');
                setUsername(response.data.username);
                setAdmin(response.data.isAdmin);
            } 
        } catch (error) {
            if (error.response && error.response.data.error) {
                setErrorMessage(error.response.data.error);
              } else {
                console.error('Login error', error);
                setErrorMessage('An error occurred during login.');
              }
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </div>
    );
}
