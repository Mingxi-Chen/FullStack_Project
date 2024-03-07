
export default function Sidebar({ activePage,setActivePage,setSortingCriterion,isLoggedIn,refreshQuestions}) {
    return (
      <>
  
        
            <a 
              href="#" 
              id="Questions" 
              className={`sidelink ${activePage === 'Questions' ? 'active-question' : ''}`} 
              onClick={() => {
                setActivePage('Questions')
                setSortingCriterion('newest')
                refreshQuestions();
              }}
            >
              Questions
            </a>
        
        
            <a 
              href="#" 
              id="Tags" 
              className={`sidelink ${activePage === 'Tags' ? 'active-tag' : ''}`} 
              onClick={() => {
                setActivePage('Tags')
                
              }}
            >
              Tags
            </a>

            {isLoggedIn && (
              <a 
                href="#" 
                id="Profile" 
                className={`sidelink ${activePage === 'Profile' ? 'active-profile' : ''}`} 
                onClick={() => setActivePage('Profile')}
              >
                Profile
              </a>
            )}

            {isLoggedIn && (
              <a 
                href="#" 
                id="mytag" 
                className={`sidelink ${activePage === 'Mytag' ? 'active-mytag' : ''}`} 
                onClick={() => setActivePage('Mytag')}
              >
                Mytag
              </a>
            )}

                {isLoggedIn && (
                  <a 
                    href="#" 
                    id="q_answered" 
                    className={`sidelink ${activePage === 'QA' ? 'active-QA' : ''}`} 
                    onClick={() => setActivePage('QA')}
                  >
                    Answered Questions
                  </a>
                )}
           
  
      </>
    );
  }