import SortButtons from './sort_button.js';
import Ask from './ask_button.js';
export default function Top({ number_of_questions, setSortingCriterion,sortingCriterion,setActivePage,isLoggedIn} ) {
    
   
    return (
     <>   
          <div className='sub1'> 
          <h2 id='all_question'>{sortingCriterion === 'search' ? 'Search Result' : 'All Questions'}</h2>
          {isLoggedIn && (
            <Ask  id='first_ask' onAskClick={() => setActivePage('post_question')}/>
          )}
          </div>
          <div className='sub1'> 
              <h3 id='number_of_q'> {number_of_questions} questions</h3>
              <SortButtons  setSortingCriterion={setSortingCriterion}/>
          </div>
     </>
    );
  }