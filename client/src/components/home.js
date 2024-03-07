// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FakeStackOverflow from './fakestackoverflow.js'
import Searchbox from './searchbox.js';
import Sidebar from './sidebar.js';
import Topinfo from './topinfo.js';
import Display from './display_questions.js';
import Answer from './answer_pg.js'
import Answer_form from './answer_form.js';
import TagPage from './tags_pg.js';
import Question_Form from './question_form.js';
import Logout from './logout.js';
import Profile from './profile.js';
import Mytag from './mytag.js';
import Question_ans from './question_answered.js';
function Home({Admin ,setActivePage1, reputation ,setIsLoggedIn,isLoggedIn,setReputation, username} ) {
  const [activePage, setActivePage] = useState('Questions');
  const [number_of_questions , setNumber_of_questions]= useState(0);
  const [questions, setQuestions] = useState([]);
  const [sortingCriterion, setSortingCriterion] = useState('newest'); 
  const [searchInput, setSearchInput] = useState(''); 
  const [answer_question, setAnswer_question] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [clickedFromMyAnswer, setClickedFromMyAnswer] = useState(false);
  const refreshQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/questions');
      setQuestions(response.data); // Assuming the response is an array of questions
      setNumber_of_questions(response.data.length);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };
  
  useEffect(() => {
  
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/questions');
        setQuestions(response.data); // Assuming the response is an array of questions
        setNumber_of_questions(response.data.length);
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  
  
  }, []);

  

  

  return (
    <div>
      <section className="fakeso">
        <Logout setActivePage1={setActivePage1} setIsLoggedIn={setIsLoggedIn} isLoggedIn={isLoggedIn} />
        <FakeStackOverflow />
        <Searchbox setSearchInput={setSearchInput} setSortingCriterion={setSortingCriterion} setActivePage={setActivePage}/>
      </section>

      <div id='main'>
        <div id='sidemenu'>
          <Sidebar activePage={activePage} setActivePage={setActivePage } setSortingCriterion={setSortingCriterion} isLoggedIn={isLoggedIn} refreshQuestions={refreshQuestions}/>
        </div>

        <div id='content'>
          {activePage === 'Answer' && (
            <Answer  setClickedFromMyAnswer={setClickedFromMyAnswer} username={username}   clickedFromMyAnswer={clickedFromMyAnswer}   isLoggedIn={isLoggedIn} answer_question={answer_question} setActivePage={setActivePage} setAnswer_question={setAnswer_question}/>
          )}

          {activePage === 'Tags' && (
            <TagPage isLoggedIn={isLoggedIn} questions={questions} setActivePage={setActivePage } setAnswer_question={setAnswer_question} refreshQuestions={refreshQuestions}/>
          )}  

          {activePage === 'Profile' && (
            <Profile Admin={Admin} setEditingQuestion={setEditingQuestion} editingQuestion={editingQuestion} setReputation={setReputation} reputation={reputation} username={username} setActivePage={setActivePage}/>
          )}  

          {activePage === 'QA' && (
            <Question_ans setClickedFromMyAnswer={setClickedFromMyAnswer}   username={username} setActivePage={setActivePage} setAnswer_question={setAnswer_question} />
          )}  

          {activePage === 'Mytag' && (
            < Mytag username={username} isLoggedIn={isLoggedIn} questions={questions} setActivePage={setActivePage } setAnswer_question={setAnswer_question} refreshQuestions={refreshQuestions}/>
          )}  
          
          {activePage === 'post_answer' && (
            <Answer_form answer_question={answer_question} setActivePage={setActivePage } refreshQuestions={refreshQuestions} />
          )}

          {activePage === 'post_question' && (
            <Question_Form setEditingQuestion={setEditingQuestion} editingQuestion={editingQuestion} setActivePage={setActivePage} refreshQuestions={refreshQuestions}  reputation={reputation} />
          )}

          {activePage === 'Questions' && (
              <>
                <div id='info'>
                  <Topinfo isLoggedIn={isLoggedIn} number_of_questions={number_of_questions} setSortingCriterion={setSortingCriterion} sortingCriterion={sortingCriterion} setActivePage={setActivePage} />
                </div>
                <div className='displayed_questions'>
                  <Display sortingCriterion={sortingCriterion} questions={questions} setNumber_of_questions={setNumber_of_questions} searchInput={searchInput} setActivePage={setActivePage} setAnswer_question={setAnswer_question } refreshQuestions={refreshQuestions}/>
                </div>
                
              </>
            )}
        </div>

      </div>

    </div>
  );
}

export default Home;








  
