import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Profile({Admin ,reputation,setReputation,username,setActivePage,setEditingQuestion,editingQuestion}) {
  const [registrationDate, setRegistrationDate] = useState('');
  const [formattedRegistrationDate, setFormattedRegistrationDate] = useState('');
  const [membershipDuration, setMembershipDuration] = useState('');
  const [userQuestions, setUserQuestions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user and all their associated data?')) {
      axios.delete(`http://localhost:8000/api/delete_user/${userId}`, { withCredentials: true })
        .then(() => {
          setAllUsers(allUsers.filter(user => user._id !== userId));
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    }
  };
  useEffect(() => {
    // Make an API request to get the user's profile data
    axios.get('http://localhost:8000/api/user-profile', { withCredentials: true })
      .then((response) => {
        const userData = response.data;
        setRegistrationDate(userData.createdAt);
        setReputation(userData.reputation); 
        formatRegistrationDate(userData.createdAt);
        calculateMembershipDuration(userData.createdAt);
      })
      .catch((error) => {
        console.error('Error fetching user data:', error);
      });


      axios.get(`http://localhost:8000/api/questions/${username}`, { withCredentials: true })
      .then((response) => {
        setUserQuestions(response.data); 
      })
      .catch((error) => {
        console.error('Error fetching user questions:', error);
      });
  }, [username]);

  const formatRegistrationDate = (dateString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-US');
    setFormattedRegistrationDate(formattedDate);
  };

  const calculateMembershipDuration = (registrationDate) => {
    const currentDate = new Date();
    const startDate = new Date(registrationDate);

    const timeDifference = currentDate - startDate;

    const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30.44));
    const days = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 30.44)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    setMembershipDuration(`${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds`);
  };

  const handleEditQuestion = (question) => {
    console.log('Before setting editingQuestion:', question);
    setEditingQuestion(question);
    console.log('After setting editingQuestion:', editingQuestion);
    setActivePage('post_question');
  };

  useEffect(() => {
    console.log(Admin);
    if (Admin) {
      
      axios.get('http://localhost:8000/api/get_users', { withCredentials: true })
        .then(response => {
          setAllUsers(response.data);
        })
        .catch(error => {
          console.error('Error fetching all users:', error);
        });
    }
  }, [username, Admin]);
  
  return (
    <div>
      <h2>User Profile</h2>
      <p>Registration Date: {formattedRegistrationDate}</p>
      <p>Membership Duration: {membershipDuration}</p>
      <p>Reputation: {reputation}</p>
      <p>name: {username}</p>

      <h3>My Questions</h3>
      <ul>
        {userQuestions.map(question => (
          <li key={question._id} onClick={() => handleEditQuestion(question)} style={{ cursor: 'pointer', color: 'blue' }}>
            {question.title}
          </li>
        ))}
      </ul>

      {/* Display all users if Admin is true */}
      {Admin && (
        <div>
          <h3>All Users</h3>
          <ul>
            {allUsers.map(user => (
              <li key={user._id}>
                {user.username}
                <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
