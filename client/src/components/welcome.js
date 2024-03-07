import React from 'react';

export default function Welcome({setActivePage1}) {
 

  const handleFormChange = (formName) => {
    setActivePage1(formName);
  };

  return (
    <>
      <h1>Welcome to FakeStackOverflow</h1>
      <button onClick={() => handleFormChange('Register')}>Register</button>
      <button onClick={() => handleFormChange('Login')}>Login</button>
      <button onClick={() => handleFormChange('Guest')}>Continue as Guest</button>
    </>
  );
}

  