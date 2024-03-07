import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Question_answered({setClickedFromMyAnswer ,username ,setAnswer_question,setActivePage}) {
    const [answeredQuestions, setAnsweredQuestions] = useState([]);
    const [myAnsweredQuestions, setMyAnsweredQuestions] = useState([]);
    
    useEffect(() => {
  
        const fetchQuestions = async () => {
          try {
            const response = await axios.get('http://localhost:8000/api/questions');
            setAnsweredQuestions(response.data); // Assuming the response is an array of questions
            
          } catch (error) {
            console.error('Error fetching questions:', error);
          }
        };
        fetchQuestions();
      
      
      }, []);

      useEffect(() => {
        // Filter and set only questions with answers from the specific user
        const filteredQuestions = answeredQuestions.filter((question) =>
          question.answers.some((answer) => answer.ans_by === username)
        );
        // Sort the filtered questions by the newest date
        filteredQuestions.sort((a, b) => new Date(b.ask_date_time) - new Date(a.ask_date_time));
        setMyAnsweredQuestions(filteredQuestions);
      }, [answeredQuestions, username]);

  function formatMetadata(postedTime) {
    const postedDate = new Date(postedTime);
    const viewedDate = new Date(); // current time

    const diffInMilliseconds = viewedDate - postedDate;
    const diffInSeconds = diffInMilliseconds / 1000;
    const diffInMinutes = diffInSeconds / 60;
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    // Less than a minute
    if (diffInMinutes < 1) {
      return ` ${Math.round(diffInSeconds)} seconds ago`;
    }
    // Less than an hour
    else if (diffInHours < 1) {
      return ` ${Math.round(diffInMinutes)} minutes ago`;
    }
    // Less than 24 hours
    else if (diffInDays < 1) {
      return ` ${Math.round(diffInHours)} hours ago`;
    }
    // More than 24 hours but same year
    else if (postedDate.getFullYear() === viewedDate.getFullYear()) {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()} at ${String(
        postedDate.getHours()
      ).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
    }
    // Different year
    else {
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
      ];
      return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()}, ${postedDate.getFullYear()} at ${String(
        postedDate.getHours()
      ).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
    }
  }


    return (
        <>
            {myAnsweredQuestions.map((question) => (
            
            <div className='question-div' key={question._id}>
              <div className='part_one'>
                <p className='display'> {question.answers.length} answers</p>
                <p className='display'>{question.views} views</p>
                
                <p className='display'>{question.votes} votes</p > {/* Display vote count */}
              </div>

              <div className='part_two'>
                <a href='#' className='title_link' onClick={() => {
                
                  setActivePage('Answer');
                  setAnswer_question(question);
                  setClickedFromMyAnswer(true);

                }}> {question.title} </a>

                <p className='question-summary'>{question.summary}</p > {/* Display question summary */}
                <div>
                  {question.tags.map((tag) => (
                    <p className='tag' key={tag._id}>{tag.name} </p>
                  ))}
                </div>
              </div>

              <div className='part_three'>
                <p className='askby'>{question.asked_by} </p>
                <p className='askwhen'> asked {formatMetadata(question.ask_date_time)}</p>
              </div>
            </div>
          ))}
        </>
    );
  }
