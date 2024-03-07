import React, { useState, useEffect } from 'react';
import Ask from './ask_button.js';
import axios from 'axios';


function chunkArray(arr, chunkSize) {
  const results = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    results.push(arr.slice(i, i + chunkSize));
  }
  return results;
}
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
      return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()} at ${String(postedDate.getHours()).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
  }

  // Different year
  else {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return ` ${monthNames[postedDate.getMonth()]} ${postedDate.getDate()}, ${postedDate.getFullYear()} at ${String(postedDate.getHours()).padStart(2, '0')}:${String(postedDate.getMinutes()).padStart(2, '0')}`;
  }
}

export default function Mytag({  username ,questions, setActivePage ,setAnswer_question,refreshQuestions ,isLoggedIn}) {
  const [tagsWithCounts, setTagsWithCounts] = useState([]);
  const [groupedTags, setGroupedTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null); // State to keep track of the selected tag
  const [displayedQuestions, setDisplayedQuestions] = useState(questions) ;
  const [editingTag, setEditingTag] = useState(null);
    const [editedTagName, setEditedTagName] = useState('');
  const increaseViewCount = async (questionId) => {
    // Optimistically update the state
    setDisplayedQuestions(currentQuestions =>
      currentQuestions.map(question =>
        question._id === questionId ? { ...question, views: question.views + 1 } : question
      )
    );

    
      // Send an API request to your backend to increase the view count
      await axios.put(`http://localhost:8000/api/questions/${questionId}/increase-view`);
      await refreshQuestions();
    
  };
  useEffect(() => {
    const countTags = () => {
      const tagMap = new Map();
  
      questions.forEach((question) => {
        question.tags.forEach((tag) => {
          // Filter tags based on the created_by field
          if (tag.created_by === username) {
            if (!tagMap.has(tag._id)) {
              tagMap.set(tag._id, { name: tag.name, count: 1 });
            } else {
              const currentCount = tagMap.get(tag._id).count;
              tagMap.set(tag._id, { name: tag.name, count: currentCount + 1 });
            }
          }
        });
      });
  
      const tagCounts = Array.from(tagMap, ([_id, { name, count }]) => [name, count]);
      setTagsWithCounts(tagCounts);
    };
  
    countTags();
  }, [questions, username]);
  

  useEffect(() => {
    setGroupedTags(chunkArray(tagsWithCounts, 3));
  }, [tagsWithCounts]);


  const handleTagClick = (tagName) => {
    // Find all questions that have the clicked tag
    const questionsWithTag = questions.filter(q =>
      q.tags.some(t => t.name === tagName)
    ).sort((a, b) => new Date(b.askDate) - new Date(a.askDate)); // Sorting by newest

    setSelectedTag({ name: tagName, count: questionsWithTag.length });
    setGroupedTags([]); 
  };

  const handleDeleteTag = async (tagName) => {
    // Check if all questions with the tag are asked by the current user
    const isTagExclusiveToUser = questions.every(question => 
      !question.tags.some(tag => tag.name === tagName) || (question.asked_by === username)
    );
  
    if (isTagExclusiveToUser) {
      try {
        // Send an API request to delete the tag
        await axios.delete(`http://localhost:8000/api/tags/delete/${tagName}`);

  
        // Update the tagsWithCounts state to remove the deleted tag
        setTagsWithCounts(currentTags => 
          currentTags.filter(tag => tag[0] !== tagName)
        );
  
        // Update displayed questions and selected tag if necessary
        if (selectedTag && selectedTag.name === tagName) {
          setSelectedTag(null);
          setGroupedTags(chunkArray(tagsWithCounts, 3));
        }
      } catch (error) {
        console.error('Error deleting tag:', error);
        // Handle error
      }
    } else {
      // Handle the case where the tag is used by other users
      alert('Cannot delete this tag because it is used by other users.');
    }
  };
  
  const handleEditTag = (tagName) => {
    setEditingTag(tagName);
    
    setEditedTagName(tagName);
  };
  
  const handleUpdateTag = async (oldTagName) => {

    const isTagExclusiveToUser = questions.every(question => 
        !question.tags.some(tag => tag.name === oldTagName) || (question.asked_by === username)
      );
    
    if (isTagExclusiveToUser){
        try {
        // Send an API request to update the tag name
        await axios.put(`http://localhost:8000/api/tags/${oldTagName}`, { newTagName: editedTagName });
    
        // Update the tagsWithCounts state to reflect the updated tag name
        setTagsWithCounts((currentTags) =>
            currentTags.map((tag) => (tag[0] === oldTagName ? [editedTagName, tag[1]] : tag))
        );
    
        // Reset editing state
        setEditingTag(null);
        setEditedTagName('');
        } catch (error) {
        console.error('Error updating tag:', error);
        // Handle error
        }
    }else{
        alert('Cannot edit this tag because it is used by other users.');
    }
  };

  return (
    <>
      <div id='top_tag' className={selectedTag ? 'dot-border' : ''}>
        {selectedTag ? (
          <>
            <h2 id='after1'>{selectedTag.name}</h2>
            <h3 id='after2'>{selectedTag.count} {selectedTag.count === 1 ? 'question' : 'questions'}</h3>
        </>
        ) : (
          <>
            <h2 id='tag_num'>{tagsWithCounts.length} Tags</h2>
            <h3 id='all_tags'>My Tags</h3>
          </>
        )}
        {isLoggedIn && (
        <Ask id='second_ask' onAskClick={() => setActivePage('post_question')} />
        )}
      </div>

      <div id='bot_tag'>
        {selectedTag ? (
          
          questions.filter(q => 
            q.tags.some(t => t.name === selectedTag.name)
          ).sort((a, b) => Date.parse(b.ask_date_time) - Date.parse(a.ask_date_time)).map(question => (
            <div key={question._id} className="tag_question">
               <div className='tag_1'>



              <p className='display'> {question.answers.length} answers</p >
              <p className='display'>{question.views} views</p >


              </div>

              <div className='tag_2'>
              <a href=" " className='title_link' onClick={() => {

              setActivePage('Answer');
              setAnswer_question(question)
              increaseViewCount(question._id);
              }} >
              {question.title}
              </a >
              <div>
                 
              </div>
                {question.tags.map((tag) => (
                      <p className='tag' key={tag._id}>{tag.name} </p >
                ))}

              </div>

              <div className='tag_3'>



              <p className='askby'>{question.asked_by} </p >
              <p className='askwhen'> asked {formatMetadata(question.ask_date_time)}</p >



              </div>
            </div>
          ))
        ) : (
          groupedTags.map((group, index) => (
            <div key={index} className="tag-group">
              {group.map(([tagName, count]) => (
                <div key={tagName} className="tag-topic">
                  <a href="#" className="tag-name" onClick={() => handleTagClick(tagName)}>
                    {tagName}
                    
                  </a >
                         <>
                        <input
                            type="text"
                            value={editedTagName}
                            onChange={(e) => setEditedTagName(e.target.value)}
                            placeholder="Enter new tag name"
                        />
                        <button onClick={() => handleUpdateTag(tagName)}>Update</button>
                        </>
                    <button onClick={() => handleDeleteTag(tagName)}>Delete</button>

                    <p className="tag-count">{count} {count === 1 ? 'question' : 'questions'}</p >
                </div>
              ))}
            </div>
          ))
          
          
        )}
      </div>
    </>
  );
}

