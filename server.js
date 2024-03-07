// Application server


const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const cors = require('cors');

app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true
}));


app.use(express.urlencoded({extended: false}));

const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/fake_so' }),
  cookie: { 
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    
  }
}));





const Question = require('./models/questions');
const Answer = require('./models/answers');
const Tags = require('./models/tags');
const Users= require('./models/users');
const Comment = require('./models/comment');
app.use(express.json());
const bcrypt = require('bcrypt');
const saltRounds = 10; 

app.post('/api/users', async (req, res) => {
  
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    const newUser = new Users({
      ...req.body,
      password: hashedPassword
    });
    const user_email = newUser.email;
    const userExist = await Users.findOne({user_email});
    
    if(userExist){
      res.status(400).send({ message: 'Email already exists' });
    }
    else{
      await newUser.save();
      res.status(201).send({ message: 'User created successfully' });
    }
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error code
      res.status(400).send({ message: 'Email already exists' });
    } else {
      res.status(500).send({ message: 'Error registering new user' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Users.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ error: 'Invalid email or password' });
    }

    req.session.userId = user._id; // Set the session userId
    req.session.username = user.username;
    req.session.reputation =user.reputation;
    req.session.isAdmin =user.isAdmin;
    res.send({message: 'Logged in successfully',isAdmin:user.isAdmin, userID:user._id ,username: user.username ,reputation: user.reputation });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});



app.post('/api/logout', (req, res) => {
  
  if (req.session.userId) {
    const userId = req.session.userId;
      // Destroy the session
      req.session.destroy((err) => {
          if (err) {
              // Handle error case
              console.error('Logout error:', err);
              return res.status(500).send({ message: 'Error logging out' });
          }

          // Clear the session cookie
          res.clearCookie('connect.sid'); 

          // Send a success response
          res.send({ message: `Logged out successfully. User ID was: ${userId}` });
      });
  } else {
      // No session, so not logged in
      res.status(401).send({ message: 'You are not logged in' });
  }
});



app.get('/api/check-auth', async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await Users.findById(req.session.userId);
      if (user) {
        res.json({ isAdmin:req.session.isAdmin, isLogged: true, userId: req.session.userId, reputation: user.reputation , username:user.username });
      } else {
        res.json({ isLogged: false });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.json({ isLogged: false });
  }
});


app.get('/api/user-profile', async (req, res) => {
  if (req.session.userId) {
    try {
      const user = await Users.findById(req.session.userId);
      if (user) {
        res.json({ createdAt: user.createdAt , reputation:user.reputation }); // Send the user's createdAt timestamp
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).send('Internal Server Error');
    }
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});

app.get('/api/questions/:questionId/upvote', async (req, res) => {
  const questionId = req.params.questionId;
  const userReputation = req.session.reputation; 

  
  if (userReputation <50) {
    return res.status(403).json({ message: 'You need at least 50 reputation to upvote' });
  }
  try {
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { votes: 1 } }, // Incrementing the votes by 1 for upvote
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const user1 = await Users.findOne({ username: question.asked_by });


    const user = await Users.findByIdAndUpdate(
      user1._id,
      { $inc: { reputation: 5 } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Upvoted successfully', votes: question.votes });
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/questions/:questionId/downvote', async (req, res) => {
  const questionId = req.params.questionId;
  const userReputation = req.session.reputation;
  if (userReputation <50) {
    return res.status(403).json({ message: 'You need at least 50 reputation to upvote' });
  }
  try {
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { votes: -1 } }, 
      { new: true }
    );

    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const user1 = await Users.findOne({ username: question.asked_by });


    const user = await Users.findByIdAndUpdate(
      user1._id,
      { $inc: { reputation: -10 } },
      { new: true }
    );

    res.json({ message: 'Upvoted successfully', votes: question.votes });
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/answers/:answerId/upvote', async (req, res) => {
  const answerId = req.params.answerId;
  const userReputation = req.session.reputation;
  if (userReputation <50) {
    return res.status(403).json({ message: 'You need at least 50 reputation to upvote' });
  }
  try {
    const answer= await Answer.findByIdAndUpdate(
      answerId,
      { $inc: { votes: 1 } }, 
      { new: true }
    );

    const user1 = await Users.findOne({ username: answer.ans_by });


    const user = await Users.findByIdAndUpdate(
      user1._id,
      { $inc: { reputation: 5 } },
      { new: true }
    );

    res.json({ message: 'Upvoted successfully' });
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/answers/:answerId/downvote', async (req, res) => {
  const answerId = req.params.answerId;
  const userReputation = req.session.reputation;
  if (userReputation <50) {
    return res.status(403).json({ message: 'You need at least 50 reputation to upvote' });
  }
  try {
    const answer= await Answer.findByIdAndUpdate(
      answerId,
      { $inc: { votes: -1 } }, 
      { new: true }
    );

    const user1 = await Users.findOne({ username: answer.ans_by });


    const user = await Users.findByIdAndUpdate(
      user1._id,
      { $inc: { reputation: -10 } },
      { new: true }
    );

    res.json({ message: 'Upvoted successfully' });
  } catch (error) {
    console.error('Error upvoting question:', error);
    res.status(500).send('Internal Server Error');
  }
});



//old code

app.get('/api/questions', async (req, res) => {
  try {
    const questions = await Question.find()
      .populate('tags')
      .populate({
        path: 'answers',
        populate: { path: 'comments', model: 'Comments' }
      })
      .populate('comments');

    // Log the questions and answers for debugging
    console.log('Questions:', questions);

    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).send('Internal Server Error');
  }
});





app.put('/api/questions/:questionId/increase-view', async (req, res) => {
  const questionId = req.params.questionId;

  try {
    const question = await Question.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { new: true } 
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'View count increased successfully', views: question.views });
  } catch (error) {
    console.error('Error increasing view count:', error);
    res.status(500).send('Internal Server Error');
  }
});


app.post('/api/answers', async (req, res) => {
  console.log(req.session.userId)
  if (!req.session.userId) {
  return res.status(401).send({ message: 'Not authorized' });
  }

try {
  const username = req.session.username;
  const newAnswer = new Answer({
    text: req.body.text,
    ans_by: username,
    ans_date_time: new Date() 
  });

  
  await newAnswer.save();

 
  const questionId = req.body.questionId;
  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).send('Question not found');
  }

 
  question.answers.push(newAnswer._id);

  await question.save();

 
  res.status(201).json(newAnswer);
} catch (error) {
  console.error('Error saving answer:', error);
  res.status(500).send('Something went wrong on the server.');
}
});

app.post('/api/comments', async (req, res) => {
  

try {
  const username = req.session.username;
  const newComment = new Comment({
    text: req.body.text,
    commented_by: username,
    commented_date_time: new Date() 
  });

  
  await newComment.save();
 
  const questionId = req.body.questionId;
  const question = await Question.findById(questionId);
  question.comments.push(newComment._id);
  await question.save();
  res.status(201).json(newComment);
} catch (error) {
  console.error('Error saving comment:', error);
  res.status(500).send('Something went wrong on the server.');
}
});

app.post('/api/commentsforanswer', async (req, res) => {
  try {
    const username = req.session.username;
    const newComment = new Comment({
      text: req.body.text,
      commented_by: username,
      commented_date_time: new Date() 
    });
  
    
    await newComment.save();
   
    const answerId = req.body.answerId;
    const answer = await Answer.findById(answerId);
    answer.comments.push(newComment._id);
    await answer.save();
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error saving comment:', error);
    res.status(500).send('Something went wrong on the server.');
  }

});






app.post('/api/questions', async (req, res) => {
  try {
    const tagNames = req.body.tags.split(' ').filter(Boolean);

   
    const lowercaseTagNames = tagNames.map((tagName) => tagName.toLowerCase());

    
    const existingTags = await Tags.find({ name: { $in: lowercaseTagNames } });

    
    const existingTagMap = new Map(existingTags.map((tag) => [tag.name.toLowerCase(), tag]));

   
    const tags = [];
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      const lowercaseTagName = lowercaseTagNames[i];

      if (existingTagMap.has(lowercaseTagName)) {
        tags.push(existingTagMap.get(lowercaseTagName)._id);
      } else {
        const newTag = new Tags({ name: tagName, created_by: req.session.username });
        await newTag.save();
        tags.push(newTag._id);
      }
    }

    
    const newQuestion = new Question({
      title: req.body.title,
      text: req.body.text,
      summary: req.body.summary,
      tags: tags,
      asked_by: req.session.username,
    
    });

    
    await newQuestion.save();

    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).send('Something went wrong on the server.');
  }
});


app.put('/api/questions/:id', async (req, res) => {
  try {
    const tagNames = req.body.tags.split(' ').filter(Boolean);

   
    const lowercaseTagNames = tagNames.map((tagName) => tagName.toLowerCase());

    
    const existingTags = await Tags.find({ name: { $in: lowercaseTagNames } });

    
    const existingTagMap = new Map(existingTags.map((tag) => [tag.name.toLowerCase(), tag]));

   
    const tags = [];
    for (let i = 0; i < tagNames.length; i++) {
      const tagName = tagNames[i];
      const lowercaseTagName = lowercaseTagNames[i];

      if (existingTagMap.has(lowercaseTagName)) {
        tags.push(existingTagMap.get(lowercaseTagName)._id);
      } else {
        const newTag = new Tags({ name: tagName, created_by: req.session.username });
        await newTag.save();
        tags.push(newTag._id);
      }
    }

    const questionId = req.params.id;
    const updatedQuestionData = req.body;
    const existingQuestion = await Question.findById(questionId);

    existingQuestion.title = updatedQuestionData.title;
    existingQuestion.summary = updatedQuestionData.summary;
    existingQuestion.text = updatedQuestionData.text;
    existingQuestion.tags = tags;
  

    
    await existingQuestion.save();

    res.json({ message: 'Question updated successfully', updatedQuestion: existingQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).send('Something went wrong on the server.');
  }
});

app.get('/api/tags', async (req, res) => {
  try {
    const tags = await Tags.find(); // Fetch all tags
    res.json(tags); // Send tags as JSON response
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/edittags', async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the tag already exists
    const existingTag = await Tags.findOne({ name });

    if (existingTag) {
      return res.status(400).json({ error: 'Tag already exists' });
    }

    // Create a new tag
    const newTag = new Tags({ name });
    await newTag.save();

    // Send the new tag as a JSON response
    res.json(newTag);
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).send('Internal Server Error');
  }
});

// API Route for Upvoting a Comment
app.get('/api/comments/:commentId/upvote', async (req, res) => {
  const commentId = req.params.commentId;

  try {
    // Find the comment and increment its votes
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { votes: 1 } }, // Increment the vote count by 1
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({ message: 'Upvoted successfully', votes: comment.votes });
  } catch (error) {
    console.error('Error upvoting comment:', error);
    res.status(500).send('Internal Server Error');
  }
});

//profile

app.get('/api/questions/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const questions = await Question.find({ asked_by: username }); 
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions for user:', error);
    res.status(500).send('Internal Server Error');
  }
});



app.delete('/api/questions/:questionId', async (req, res) => {
  const questionId = req.params.questionId;

  try {
    
    const question = await Question.findById(questionId).populate('answers comments');

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    
    for (const comment of question.comments) {
      await Comment.findByIdAndDelete(comment._id);
    }

    // Delete all associated answers and their comments
    for (const answer of question.answers) {
      // Delete answer comments
      for (const comment of answer.comments) {
        await Comment.findByIdAndDelete(comment._id);
      }
      // Delete the answer itself
      await Answer.findByIdAndDelete(answer._id);
    }

    // Finally, delete the question itself
    await Question.findByIdAndDelete(questionId);

    res.json({ message: 'Question and associated data deleted successfully' });
  } catch (error) {
    console.error('Error deleting question and associated data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/api/questions/:id', async (req, res) => {
  const questionId = req.params.id;
  const updatedQuestionData = req.body;

  try {
    const existingQuestion = await Question.findById(questionId);

    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    existingQuestion.title = updatedQuestionData.title;
    existingQuestion.summary = updatedQuestionData.summary;
    existingQuestion.text = updatedQuestionData.text;
    existingQuestion.tags = updatedQuestionData.tags;

    const updatedQuestion = await existingQuestion.save();

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.delete('/api/tags/delete/:tagName', async (req, res) => {
  const tagName = req.params.tagName;

  try {
    // Find the tag by name to get its _id
    const tag = await Tags.findOne({ name: tagName });

    if (!tag) {
      // Tag not found
      return res.status(404).json({ error: 'Tag not found.' });
    }

    // Tag is not in use, proceed with deletion
    await Tags.deleteOne({ _id: tag._id });

    res.json({ success: true, message: 'Tag deleted successfully.' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.put('/api/tags/:oldTagName', async (req, res) => {
  const oldTagName = req.params.oldTagName;
  const newTagName = req.body.newTagName;

  try {
    // Check if the new tag name already exists
    const existingTag = await Tags.findOne({ name: newTagName });
    if (existingTag) {
      return res.status(400).json({ error: 'Tag with the new name already exists.' });
    }

    // Find the tag by the old name and update it
    const updatedTag = await Tags.findOneAndUpdate(
      { name: oldTagName },
      { name: newTagName },
      { new: true }
    );

    if (!updatedTag) {
      return res.status(404).json({ error: 'Tag not found.' });
    }

    res.json({ success: true, message: 'Tag updated successfully.', updatedTag });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.get('/api/questions/answered/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const userAnswers = await Answer.find({ ans_by: username });
    const userAnswerIds = userAnswers.map(answer => answer._id);
    const questionsWithUserAnswers = await Question.find({
      'answers': { $in: userAnswerIds }
    });
    console.log(questionsWithUserAnswers);
    // Fetch all questions asked by the specific user
    

    res.json(questionsWithUserAnswers);
    
  } catch (error) {
    console.error('Error fetching asked questions:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/api/answers/:answerId', async (req, res) => {
  const answerId = req.params.answerId;

  try {
    // Find the answer by its ID
    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Delete associated comments
    await Comment.deleteMany({ answer: answerId });

    // Delete the answer
    await Answer.findByIdAndDelete(answerId);

    res.status(200).json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.put('/api/answers/:answerId', async (req, res) => {
  try {
    const { answerId } = req.params;
    const { text } = req.body;

    // Check if the answer exists
    const answer = await Answer.findById(answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    

    // Update the answer's text
    answer.text = text;
    await answer.save();

    res.status(200).json({ message: 'Answer updated successfully' });
  } catch (error) {
    console.error('Error editing answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/get_users',  async (req, res) => {
  try {
    const users = await Users.find({},); 
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error });
  }
});

app.delete('/api/delete_user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
      // Delete user
      await Users.findByIdAndDelete(userId);

      // Delete related data
      await Question.deleteMany({ asked_by: userId });
      await Answer.deleteMany({ ans_by: userId });
      await Comment.deleteMany({ commented_by: userId });
      await Tags.deleteMany({ created_by: userId });

      res.json({ message: 'User and all associated data deleted successfully.' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting user', error });
  }
});

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/fake_so', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  
  
  process.on('SIGINT', () => {
    db.close(); 
  
   
    db.once('close', () => {
      console.log('Server closed. Database instance disconnected');
      process.exit(0);
    });
});





