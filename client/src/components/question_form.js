import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuestionForm({ setActivePage, refreshQuestions, reputation, editingQuestion, setEditingQuestion }) {

  

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    text: '',
    tags: '',
   
  });

  useEffect(() => {
    console.log('Received editingQuestion:', editingQuestion); // Debugging
    if (editingQuestion) {
      // Assuming editingQuestion.tags is an array of tag IDs
      const tagIds = editingQuestion.tags;
  
      // Fetch tag names based on tag IDs
      const fetchTagNames = async () => {
        try {
          const response = await axios.get('http://localhost:8000/api/tags');
          const allTags = response.data;
          const tagNames = tagIds.map((tagId) => {
            const tag = allTags.find((t) => t._id === tagId);
            return tag ? tag.name : ''; // Get the tag name, or an empty string if not found
          });
  
          // Set the formData state with tag names
          setFormData({
            title: editingQuestion.title,
            summary: editingQuestion.summary,
            text: editingQuestion.text,
            tags: tagNames.join(' '), // Pre-fill the tags field with the tag names
          });
        } catch (error) {
          console.error('Error fetching tags:', error);
        }
      };
  
      fetchTagNames();
    }
  }, [editingQuestion]);
  
  

  const [tagsError, setTagsError] = useState('');
  const [existingTags, setExistingTags] = useState([]);
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleTextChange = (event) => {
    const textValue = event.target.value;

    // Regular expression to extract [name](url) hyperlinks
    const hyperlinkRegex = /\[([^\]]*)\]\(([^\)]*)\)/g;
    const result = hyperlinkRegex.exec(textValue);
    let hasValidationError = false;

    if (result) {
      if (result[2] === '') {
        alert('URL inside () cannot be empty');
        hasValidationError = true;
      }

      if (!result[2].startsWith('http://') && !result[2].startsWith('https://')) {
        alert("The URL inside () does not start with 'http://' or 'https://'");
        hasValidationError = true;
      }
    }

    if (!hasValidationError) {
      setFormData({
        ...formData,
        text: event.target.value,
      });
    }
  };

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tags');
        setExistingTags(response.data); // Assuming the response is an array of tags
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };

    fetchTags();
  }, []);

  
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation checks
    let isValid = true;

    if (formData.text.trim() === '') {
      alert('Question text cannot be empty!');
      isValid = false;
    }

    const inputTags = formData.tags.split(' ').filter(Boolean);

    if (inputTags.length > 5) {
      setTagsError('You cannot have more than 5 tags.');
      isValid = false;
    } else {
      setTagsError('');
    }

    for (let tag of inputTags) {
      if (tag.length > 20) {
        setTagsError('Each tag should not be more than 20 characters.');
        isValid = false;
        break;
      }
    }

    // Check if any of the input tags are not in existing tags and the user has less than 50 reputation
    if (reputation < 50) {
      const existingTagNames = existingTags.map(tag => tag.name.toLowerCase());
      const isNewTagPresent = inputTags.some(inputTag => !existingTagNames.includes(inputTag.toLowerCase()));


      if (isNewTagPresent) {
        setTagsError('You need at least 50 reputation points to create new tags.');
        isValid = false;
      }
    }

    if (!isValid) {
      return; // Prevent form submission if validation fails
    }

    // Submit form logic here
    try {
      const response = await axios.post('http://localhost:8000/api/questions', formData ,{ withCredentials: true } );
      setActivePage('Questions');
      refreshQuestions();
    } catch (error) {
      console.error('Error posting question:', error);
      // Handle submission error
    }
};

const handleRepost = async (event) => {
  event.preventDefault();

  // Validation checks
  let isValid = true;

  if (formData.text.trim() === '') {
    alert('Question text cannot be empty!');
    isValid = false;
  }

  const inputTags = formData.tags.split(' ').filter(Boolean);

  if (inputTags.length > 5) {
    setTagsError('You cannot have more than 5 tags.');
    isValid = false;
  } else {
    setTagsError('');
  }

  for (let tag of inputTags) {
    if (tag.length > 20) {
      setTagsError('Each tag should not be more than 20 characters.');
      isValid = false;
      break;
    }
  }

  // Check if any of the input tags are not in existing tags and the user has less than 50 reputation
  if (reputation < 50) {
    const existingTagNames = existingTags.map(tag => tag.name.toLowerCase());
    const isNewTagPresent = inputTags.some(inputTag => !existingTagNames.includes(inputTag.toLowerCase()));


    if (isNewTagPresent) {
      setTagsError('You need at least 50 reputation points to create new tags.');
      isValid = false;
    }
  }

  if (!isValid) {
    return; // Prevent form submission if validation fails
  }

  // Submit form logic here
  try {
    const questionId = editingQuestion._id;
    const response = await axios.put(`http://localhost:8000/api/questions/${questionId}`, formData, { withCredentials: true });
    setActivePage('Questions');
    refreshQuestions();
    setEditingQuestion (null);
  } catch (error) {
    console.error('Error posting question:', error);
    // Handle submission error
  }
};



const handleDelete = async () => {
  try {
    // Make a DELETE request to the API endpoint with the question's ID
    await axios.delete(`http://localhost:8000/api/questions/${editingQuestion._id}`);

    // After successful deletion, reset the editing question and update the question list
    setActivePage('Questions');
    setEditingQuestion(null);
    refreshQuestions();
    
    
  } catch (error) {
    console.error('Error deleting question:', error);
    // Handle error, e.g., show an error message to the user
  }
};



  return (
    <div>
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="questionTitle" id="q1">
          <h1 className="Qone">Question Title *</h1>
          <h3 className="Qone">Limit title to 50 characters or less</h3>
        </label>
        <textarea
          id="questionTitle"
          className="Qthree"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Web scripting invalid syntax URL"
          maxLength={50}
          required
        />

        <label htmlFor="questionText">
          <h1 className="Qone">Question Text *</h1>
          <h3 className="Qone">Add details</h3>
        </label>
        <textarea
          id="questionText"
          className="Qtwo"
          name="text"
          value={formData.text}
          onChange={handleTextChange}
          placeholder="I am a beginner of web scripting](https:// www.britannica.com/topic/Web-script). There is a syntax error shown inside the URL of my script:"
          required
        />

        <label htmlFor="tags">
          <h1 className="Qone">Tags*</h1>
          <h3 className="Qone">Add keywords separated by whitespace</h3>
        </label>
        <textarea
          id="tags"
          className="Qfour"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="web-scripting html urls"
          required
        />
        {tagsError && <div style={{ color: 'red' }}>{tagsError}</div>}

        <label htmlFor="questionSummary">
          <h1 className="Qone">Question Summary *</h1>
          <h3 className="Qone">Limit summary to 140 characters</h3>
        </label>
        <textarea
          id="questionSummary"
          className="Qfour"
          name="summary"
          value={formData.summary}
          onChange={handleChange}
          placeholder="Brief summary of the question"
          maxLength={140}
          required
        />
        {editingQuestion ? (
          <>
            {/* Display delete and repost buttons when editing */}
            <button type="button" className="Qfive" onClick={handleDelete}>Delete</button>
            <button type="button" className="Qfive" onClick={handleRepost}>Repost</button>
          </>
        ) : (
          // Display submit button for new questions
          <input type="submit" className="Qfive" value="Post Question" />
        )}
        
        <p id="Qsix">* indicates mandatory fields</p>
      </form>
    </div>
  );
}
