import React, { useState } from 'react';
import axios from 'axios';
export default function AnswerForm({ answer_question,setActivePage,refreshQuestions}) {
    const [answerText, setAnswerText] = useState('');
    

    const submitAnswer = async () => {
        
            const response = await axios.post('http://localhost:8000/api/answers', {
                     questionId: answer_question._id,
                     text: answerText,
                 }, { withCredentials: true });
            refreshQuestions();
            
        
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        

        let hasValidationError = false;
        
        const hyperlinkRegex = /\[([^\]]*)\]\s*\(([^\)]*)\)/g;
        console.log(hyperlinkRegex)
        console.log(answerText)
        
        const result = hyperlinkRegex.exec(answerText)
        console.log(result)
        
        
        
        if(result){
        console.log(result[0])
        console.log(result[1])
        console.log(result[2])
        if(result[2]==''){
            alert('result[2] is empty');
            console.log('result[2] is empty')
            hasValidationError = true; 
        }

        if (!result[2].startsWith("http://") && !result[2].startsWith("https://")) {
            alert("The URL inside () does not start with 'http://' or 'https://'");
            console.log("The URL inside () does not start with 'http://' or 'https://'");
            hasValidationError = true; 
        }
        }
       
        if (hasValidationError) {
            return;
        }

    
        setActivePage('Questions');
        submitAnswer(); 
    };

    return (
        <div className="answer-form" >
            <form onSubmit={handleSubmit}>
                
                <label>

                    Answer Text*
                    <textarea
                        id ='bot_input'
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        
                        required
                    />
                </label>
                <button className='post_ans' type="submit">Post Answer</button>
                <h3 className='indic'>* indicates mandatory fields</h3>

            </form>

        </div>
    );
}