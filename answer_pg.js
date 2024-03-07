import Ask from './ask_button.js';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
export default function Answer_pg({answer_question,setActivePage,isLoggedIn,setAnswer_question,setClickedFromMyAnswer,username,clickedFromMyAnswer}){
    // State for comment pagination
  const [currentCommentPage, setCurrentCommentPage] = useState(1);
  const commentsPerPage = 3;
  const [editMode, setEditMode] = useState(false);
  const [editedAnswerText, setEditedAnswerText] = useState('');
  const handleEditAnswer = (answerId, currentText) => {
    setEditMode(true);
    setEditedAnswerText(currentText);
  };

  

  const handleSaveEdit = async (answerId) => {
    try {
      // Make an API request to update the answer text
      const response = await axios.put(
        `http://localhost:8000/api/answers/${answerId}`,
        { text: editedAnswerText },
        { withCredentials: true }
      );

      if (response.status === 200) {
        // Update the state to reflect the edited text
        const updatedAnswers = answer_question.answers.map((answer) =>
          answer._id === answerId ? { ...answer, text: editedAnswerText } : answer
        );

        setAnswer_question((prevState) => ({
          ...prevState,
          answers: updatedAnswers
        }));

        setEditMode(false);
      }
    } catch (error) {
      console.error('Error editing answer:', error);
      // Handle errors, e.g., display a message
    }
  };

  
  const handleUpvoteComment2 = (commentId, answerId) => {
    axios.get(`http://localhost:8000/api/comments/${commentId}/upvote`, { withCredentials: true })
      .then(response => {
        // Update the state with the new vote count for the specific comment
        const updatedAnswers = answer_question.answers.map(answer => {
          if (answer._id === answerId) {
            const updatedComments = answer.comments.map(comment => {
              if (comment._id === commentId) {
                return { ...comment, votes: comment.votes + 1 }; // Increment vote count
              }
              return comment;
            });
            return { ...answer, comments: updatedComments };
          }
          return answer;
        });
  
        setAnswer_question(prevState => ({
          ...prevState,
          answers: updatedAnswers
        }));
      })
      .catch(error => {
        console.error('Error upvoting comment:', error);
        // Handle errors, e.g., display a message
      });
  };
  


  const handleUpvoteComment = (commentId) => {
    // Make an API request to upvote the comment
    axios.get(`http://localhost:8000/api/comments/${commentId}/upvote`, { withCredentials: true })
      .then(response => {
        // Update the comments state with the new vote count
        const updatedComments = answer_question.comments.map(comment => {
          if (comment._id === commentId) {
            return { ...comment, votes: comment.votes + 1 }; // Increment vote count
          }
          return comment;
        });
        setAnswer_question(prevState => ({
          ...prevState,
          comments: updatedComments
        }));
      })
      .catch(error => {
        console.error('Error upvoting comment:', error);
        // Handle errors, e.g., display a message
      });
  };

  // Function to handle the next page of comments
  const handleNextCommentPage = () => {
    setCurrentCommentPage((prevPage) =>
      prevPage < totalCommentPages ? prevPage + 1 : 1
    );
  };

  // Function to handle the previous page of comments
  const handlePrevCommentPage = () => {
    setCurrentCommentPage((prevPage) =>
      prevPage > 1 ? prevPage - 1 : prevPage
    );
  };

  // Calculate the range of comments to be displayed
  const indexOfLastComment = currentCommentPage * commentsPerPage;
  const indexOfFirstComment = indexOfLastComment - commentsPerPage;
  


    const [votes, setVotes] = useState(answer_question.votes);
    
    const [errorMessage, setErrorMessage] = useState('');
    const [newComment, setNewComment] = useState('');
    const handleKeyDown = (event) => {
        // Check if the Enter key is pressed
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Prevent the default action to avoid newline in textarea
          handleAddComment();
        }
    };


    const handleAddComment = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/comments', {
                questionId: answer_question._id,
                text: newComment,
            }, { withCredentials: true });
    
            // Check if the response was successful
            
                // Add the new comment to the existing comments in the state
                const updatedComments = [...answer_question.comments, response.data];
                // Update the answer_question state with the new comments array
                setAnswer_question(prevState => ({
                    ...prevState,
                    comments: updatedComments
                }));
                // Clear the new comment input field
                setNewComment('');
            
        } catch (error) {
            console.error('Error posting new comment:', error);
            if (error.response) {
                setErrorMessage(error.response.data.message);
            }
        }
    };
    
    


  const handleUpvote = () => {
    const questionId = answer_question._id;

    axios.get(`http://localhost:8000/api/questions/${questionId}/upvote`, { withCredentials: true })
      .then(response => {
        setVotes(response.data.votes);
      })
      .catch(error => {
        if (error.response && error.response.status === 403) {
          setErrorMessage(error.response.data.message);
        } else {
          console.error('Error downvoting question:', error);
        }
      });
  };

  
  //useEffect(() => {
    
    //console.log('Votes updated:', votes);
  
   
 // }, [votes]);
    
  const handleDownvote = () => {
    const questionId = answer_question._id;

    // Make an API request to handle downvote
    axios.get(`http://localhost:8000/api/questions/${questionId}/downvote`, { withCredentials: true })
      .then(response => {
        setVotes(response.data.votes);
      })
      .catch(error => {
        if (error.response && error.response.status === 403) {
          setErrorMessage(error.response.data.message);
        } else {
          console.error('Error downvoting question:', error);
        }
      });
  };
        
    
    
    
    const handleAnswerClick = () => {
            setActivePage('post_answer');
            
        };
        const sortedAnswers = answer_question.answers.sort((a, b) => {
          // Check if clickedFromMyAnswer is true and sort accordingly
          if (clickedFromMyAnswer) {
            // Sort by answers where ans_by is equal to username first, then by newest
            if (a.ans_by === username && b.ans_by === username) {
              return new Date(b.ans_date_time) - new Date(a.ans_date_time);
            } else if (a.ans_by === username) {
              return -1;
            } else if (b.ans_by === username) {
              return 1;
            } else {
              return new Date(b.ans_date_time) - new Date(a.ans_date_time);
            }
          } else {
            // Sort all answers by newest
            return new Date(b.ans_date_time) - new Date(a.ans_date_time);
          }
        });
        
    const sortedQ_comments = answer_question.comments.sort((a, b) => new Date(b.ans_date_time) - new Date(a.ans_date_time));

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
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
            return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()} , ${String(postedDate.getHours()).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
    
        }
        // Different year
        else {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
            return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()}, ${postedDate.getFullYear()} , ${String(postedDate.getHours()).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
    
        }
    }
    const initialAnswerVotes = answer_question.answers.reduce((votes, answer) => {
        votes[answer._id] = answer.votes; 
        return votes;
      }, {});
      
      const [answerVotes, setAnswerVotes] = useState(initialAnswerVotes);
      
    const handleUpvoteAnswer = (answerId) => {
        axios
          .get(`http://localhost:8000/api/answers/${answerId}/upvote`, { withCredentials: true })
          .then(() => {
            // Update the state based on the previous state
            setAnswerVotes((prevVotes) => ({ ...prevVotes, [answerId]: (prevVotes[answerId] || 0) + 1 }));
          })
          .catch((error) => {
            if (error.response && error.response.status === 403) {
              setErrorMessage(error.response.data.message);
            } else {
              console.error(`Error upvoting answer ${answerId}:`, error);
            }
          });
      };
    
      const handleDownvoteAnswer = (answerId) => {
        axios
          .get(`http://localhost:8000/api/answers/${answerId}/downvote`, { withCredentials: true })
          .then(() => {
            setAnswerVotes((prevVotes) => ({ ...prevVotes, [answerId]: (prevVotes[answerId] || 0) - 1 }));
          })
          .catch((error) => {
            if (error.response && error.response.status === 403) {
              setErrorMessage(error.response.data.message);
            } else {
              console.error(`Error downvoting answer ${answerId}:`, error);
            }
          });
      };

      const totalCommentPages = Math.ceil(sortedQ_comments.length / commentsPerPage);
      const currentComments = sortedQ_comments.sort((a, b) => new Date(b.commented_date_time) - new Date(a.commented_date_time)).slice(indexOfFirstComment, indexOfLastComment);

      // answer comments
      const [answerComments, setAnswerComments] = useState({});
      const handleAnswerCommentChange = (answerId, event) => {
        setAnswerComments({ ...answerComments, [answerId]: event.target.value });
      };

      const handleAnswerCommentSubmit = async (event, answerId) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault(); // Prevent default to stop newline in the input box
      
          const commentText = answerComments[answerId];
          if (commentText) {
            try {
              // Make an API call to submit the comment
              const response = await axios.post('http://localhost:8000/api/commentsforanswer', {
                answerId: answerId,
                text: commentText,
              }, { withCredentials: true });
      
              if (response.status === 201) {
                // Add the new comment to the corresponding answer's comments in the state
                const updatedAnswers = answer_question.answers.map(answer => {
                  if (answer._id === answerId) {
                    return { ...answer, comments: [...answer.comments, response.data] };
                  }
                  return answer;
                });
      
                // Update the answer_question state with the new answers array
                setAnswer_question(prevState => ({
                  ...prevState,
                  answers: updatedAnswers
                }));
      
                // Clear the input field
                setAnswerComments({ ...answerComments, [answerId]: '' });
              }
            } catch (error) {
              console.error('Error posting new comment:', error);
              // Handle error (e.g., setting an error message state)
            }
          }
        }
      };

      const handleDeleteAnswer = async (answerId) => {
        try {
          // Make an API request to delete the answer
          const response = await axios.delete(`http://localhost:8000/api/answers/${answerId}`, { withCredentials: true });
    
          if (response.status === 200) {
            // Update the state to reflect the deletion
            const updatedAnswers = answer_question.answers.filter(answer => answer._id !== answerId);
    
            setAnswer_question(prevState => ({
              ...prevState,
              answers: updatedAnswers
            }));
          }
        } catch (error) {
          console.error('Error deleting answer:', error);
          // Handle errors, e.g., display a message
        }
      }; 
      
      
    

    return (

        <>  
            {errorMessage && (

                alert(errorMessage),
                setErrorMessage('')
            )}
            <div id='answer_outer' >
                <div id='answer-top'>
                    <div id='a1'>
                        <h3 id='a1_item'>{answer_question.answers.length} answer</h3>
                    </div>
                    <div id='a2'>
                        <h2> {answer_question.title}    </h2>
                    </div>
                    <div id='a3'>
                    {isLoggedIn && (
                        <Ask id='third_ask' onAskClick={() => setActivePage('post_question')}/>
                    )}
                    </div>
                </div>

                
            
                <div id='answer-bot'>
                    <div id='a11'>
                        <h3 id='answer_views'>{answer_question.views+1} views</h3>
                        <h3 id='votes_views'>{votes} votes</h3>
                        {isLoggedIn && (
                        <div id='vote_buttons'>
                            <button id='upvote_button' onClick={handleUpvote}>
                            Upvote
                            </button>
                            <button id='downvote_button' onClick={handleDownvote}>
                            Downvote
                            </button>
                        </div>
                        )}
                    </div>
                    <div id='a12'>
                            <p>{answer_question.text}</p>
                            <div id='comments_section'>
                            <p>comment:</p>
                            {currentComments.map((comment) => (
                                <div key={comment._id} className='comment'>
                                    <p>{comment.text}</p>

                                    <div className="comment-actions">
                                        {isLoggedIn && (
                                            <button onClick={() => handleUpvoteComment(comment._id)}>
                                                Upvote
                                            </button>
                                        )}
                                        <p className="comment-meta">
                                            Commented by: {comment.commented_by} at {formatMetadata(comment.commented_date_time)}
                                        </p>
                                    </div>
                                    <p>Votes: {comment.votes}</p>
                                </div>
                            ))}

        <div className="comment-pagination">
          <button onClick={handlePrevCommentPage} disabled={currentCommentPage === 1}>Prev</button>
          <button onClick={handleNextCommentPage} disabled={currentCommentPage === totalCommentPages}>Next</button>
        </div>
                       
                        {isLoggedIn && (
                        <div>
                            <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown} // Add the onKeyDown event handler
                        />
                        </div>
                        )}
                    </div>
                    </div>
                    <div id='a13'>
                            <p id='answer_askBy'>{answer_question.asked_by} </p>
                            <p id='answer_askDate'> asked {formatMetadata(answer_question.ask_date_time)}</p>
                    </div>
                </div>
            </div>

            <div id='all_answers'>
            {sortedAnswers.map((answer, index) => (
                <div key={answer._id} className='answer_div'>
                    <div id='one'>
                            <p id='text_answer'>{answer.text}</p>
                            <p id="answer_votes">{answerVotes[answer._id] || 0} votes</p>
                            {isLoggedIn && (
                                            <>
                                              <button id='upvote_button1' onClick={() => handleUpvoteAnswer(answer._id)}>
                                                Upvote
                                              </button>
                                              <button id='downvote_button1' onClick={() => handleDownvoteAnswer(answer._id)}>
                                                Downvote
                                              </button>
                                              {clickedFromMyAnswer && answer.ans_by === username ? (
                                                <>
                                                  <button id='delete_button' onClick={() => handleDeleteAnswer(answer._id)}>
                                                    Delete
                                                  </button>
                                                  {editMode ? (
                                                        <>
                                                          <input
                                                            type="text"
                                                            value={editedAnswerText}
                                                            onChange={(e) => setEditedAnswerText(e.target.value)}
                                                          />
                                                          <button id='save_edit_button' onClick={() => handleSaveEdit(answer._id)}>
                                                            Save
                                                          </button>
                                                        </>
                                                      ) : (
                                                        <button id='edit_button' onClick={() => handleEditAnswer(answer._id, answer.text)}>
                                                          Edit
                                                        </button>
                                                      )}
                                                </>
                                              ) : null}
                                              <div>
                                                <input
                                                  type="text"
                                                  placeholder="Add a comment"
                                                  value={answerComments[answer._id] || ''}
                                                  onChange={(e) => handleAnswerCommentChange(answer._id, e)}
                                                  onKeyDown={(e) => handleAnswerCommentSubmit(e, answer._id)}
                                                />
                                              </div>
                                            </>
                                          )}



                                    <div className="answer-comments">
                                        {answer.comments.map((comment) => {
                                            // Log each comment to the console
                                            console.log(comment);

                                            return (
                                            <div key={comment._id} className="comment">
                                                <p>{comment.text}</p>
                                                <p>{comment.votes} votes</p>
                                                <div className="comment-meta">
                                                    <span>Commented by: {comment.commented_by}</span>
                                                    <span> on {formatMetadata(comment.commented_date_time)}</span>
                                                    {isLoggedIn && (
                                                    <button onClick={() => handleUpvoteComment2(comment._id,answer._id)}>
                                                        Upvote
                                                    </button>
                                                    )}
                                                    </div>
                                            </div>
                                            );
                                        })}
                                        </div>

                                
                    </div>
                    <div id='two'>
                                <h3 id='answer_by_'>{answer.ans_by}</h3>
                                <p id='answer_time_'>Answered {formatMetadata(answer.ans_date_time)}</p>
                    </div>
                </div>
            ))}

            </div> 
            {isLoggedIn && (
                <button id='answer_question_button' onClick={handleAnswerClick} >Answer Question</button>  
            )}   
        </>
    );
}