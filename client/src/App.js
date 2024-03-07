// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import axios from 'axios';
import Welcome from './components/welcome.js';
import RegistrationForm from './components/newuser.js'
import Login from './components/login.js'
import React, { useState, useEffect } from 'react';
import Home from './components/home'

function App() {
  const [activePage1, setActivePage1] = useState('Welcome');
  
  const [reputation,setReputation]=useState(0);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [username,setUsername]=useState('');

  const [Admin,setAdmin]= useState(false);
  useEffect(() => {
    const checkAuth = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/check-auth', { withCredentials: true });
            if (response.data.isLogged) {
              setActivePage1('Home');
              setIsLoggedIn(true);
              setReputation(response.data.reputation);
              setUsername(response.data.username);
              setAdmin(response.data.isAdmin);
            } else {
                // User is not logged in, handle accordingly
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
        }
    };
    checkAuth();
}, []);

  return (
    <>
      {activePage1 === 'Welcome' && (
            <Welcome setActivePage1={setActivePage1} />
      )}

      {activePage1 === 'Register' && (
            <RegistrationForm setActivePage1={setActivePage1}/>
      )}    

      {activePage1 === 'Login' && (
            <Login setAdmin={setAdmin} setActivePage1={setActivePage1}  setReputation={setReputation} setUsername={setUsername} setIsLoggedIn={setIsLoggedIn}/>
      )} 

      {activePage1 === 'Guest' && (
          <Home setActivePage1={setActivePage1} />
      )}

      {activePage1 === 'Home' && (
            <Home  Admin={Admin} username={username}   setActivePage1={setActivePage1}  reputation={reputation} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} setReputation={setReputation}  />
      )} 

    
    
    </>
  );
}

export default App;
