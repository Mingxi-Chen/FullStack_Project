import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Display({ sortingCriterion, questions, setNumber_of_questions ,searchInput,setActivePage, setAnswer_question,refreshQuestions}) {
  const [displayedQuestions, setDisplayedQuestions] = useState(questions) ;
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 5;
  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;
  const currentQuestions = displayedQuestions.slice(indexOfFirstQuestion, indexOfLastQuestion);
  const totalQuestions = displayedQuestions.length;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  
  
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  



  useEffect(() => {
    const sortQuestions = () => {
        let sorted = [...questions];
        if(sorted.length==0){
          return
        }
          

        if (sortingCriterion === 'newest') {
          sorted.sort((a, b) => Date.parse(b.ask_date_time) - Date.parse(a.ask_date_time));
          
          //console.log(Date.parse(sorted[0].ask_date_time)-Date.parse(sorted[1].ask_date_time));
        } else if (sortingCriterion === 'active') {
          sorted.sort((a, b) => {
            // Find the most recent answer date for question a
            const mostRecentAnswerDateA = Math.max(
              ...a.answers.map((answer) => new Date(answer.ans_date_time))
            );
      
            // Find the most recent answer date for question b
            const mostRecentAnswerDateB = Math.max(
              ...b.answers.map((answer) => new Date(answer.ans_date_time))
            );
      
            // Sort by the difference between most recent answer dates in descending order
            return mostRecentAnswerDateB - mostRecentAnswerDateA;
          });
        } else if (sortingCriterion === 'unanswered') {
          sorted = sorted.filter((question) => question.answers.length === 0);
          sorted.sort((a, b) => b.ask_date_time - a.ask_date_time);
        } else if (sortingCriterion === 'search') {
          const lowerCaseInput = searchInput.toLowerCase();
          const tokens = lowerCaseInput.match(/\[[^\]]+\]|\S+/g) || []; // Split by brackets or non-space characters
      
          const tagSearchTokens = [];
          const wordSearchTokens = [];
      
          // Split tokens into tags and words
          tokens.forEach((token) => {
            if (token.startsWith('[') && token.endsWith(']')) {
              // Handle tags
              tagSearchTokens.push(token.slice(1, -1));
            } else {
              // Handle words
              const wordsInToken = token.split(/\b/).filter(Boolean);
              wordSearchTokens.push(...wordsInToken);
            }
          });
      
          sorted = questions.filter((question) => {
            const hasMatchingTag = question.tags.some((tag) => tagSearchTokens.includes(tag.name.toLowerCase()));
            const hasMatchingWord =
              wordSearchTokens.some(
                (token) =>
                  question.title.toLowerCase().includes(token) || question.text.toLowerCase().includes(token)
              );
            return hasMatchingTag || hasMatchingWord;
          });
      
          sorted.sort((a, b) => b.ask_date_time - a.ask_date_time);
        }
      
        setDisplayedQuestions(sorted);

        setNumber_of_questions(sorted.length);
      };
      
      

    sortQuestions();
  }, [sortingCriterion, questions, setNumber_of_questions, searchInput]);

  const increaseViewCount = async (questionId) => {
    // Optimistically update the state
    
    setDisplayedQuestions(currentQuestions =>
      currentQuestions.map(question =>
        question._id === questionId ? { ...question, views: question.views + 1 } : question
       
      )
    );
  
    try {
      // Send an API request to your backend to increase the view count
      await axios.put(`http://localhost:8000/api/questions/${questionId}/increase-view`);
      await refreshQuestions();
    } catch (error) {
      // If the API call fails, revert the optimistic update
      console.error('Error increasing view count:', error);
      setDisplayedQuestions(currentQuestions =>
        currentQuestions.map(question =>
          question._id === questionId ? { ...question, views: question.views - 1 } : question
        )
      );
    }
  };
  
  
  
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
      
      {currentQuestions.length === 0 ? (
        <div className='zero_div'>
          <p id='zero_p'>No Questions Found</p>
        </div>
      ) : (
        <>
          {currentQuestions.map((question) => (
            
            <div className='question-div' key={question._id}>
              <div className='part_one'>
                <p className='display'> {question.answers.length} answers</p>
                <p className='display'>{question.views} views</p>
                
                <p className='display'>{question.votes} votes</p > {/* Display vote count */}
              </div>

              <div className='part_two'>
                <a href='#' className='title_link' onClick={() => {
                  increaseViewCount(question._id);
                  setActivePage('Answer');
                  setAnswer_question(question);
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
          <div className="pagination-buttons">
        <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
        <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
      </div>

        </>
      )}
    </>
);

}

export default Display;