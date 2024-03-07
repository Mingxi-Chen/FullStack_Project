import React, { useState } from 'react';
import axios from 'axios';

export default function Newuser({setActivePage1}) {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage('Please enter a valid email address.');
            return; // Prevent form submission
        }

        if (formData.password.includes(formData.username) || formData.password.includes(formData.email.split('@')[0])) {
            setErrorMessage('Password should not contain username or email id');
            return;
        }

        if (formData.password !== passwordConfirm) {
            setErrorMessage('Passwords do not match');
            return; // Prevent the form from being submitted
        }

        try {
            const response = await axios.post('http://localhost:8000/api/users', formData);
            if (response.status === 201) {
                console.log('User registered successfully');
                setSuccessMessage('User created successfully!');
                setErrorMessage(''); // Clear any existing error messages
                // Additional logic on successful registration
                setTimeout(() => {
                    setActivePage1('Login');
                }, 2000); // 2000 milliseconds = 2 seconds

            }
        } catch (error) {
            if (error.response && error.response.data.message) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('An error occurred during registration.');
            }
            setSuccessMessage(''); // Clear any existing success messages
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
            />
            <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
            />
            <input
                type="password"
                name="passwordConfirm"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="Confirm Password"
                required
            />
            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                required
            />
            <button type="submit">Submit</button>
            {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
        </form>
    );
}
