// Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
// Setup database with initial test data.

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User= require('./models/users'); // Import your User model
const Question = require('./models/questions');
const Tag = require('./models/tags');
const Comment = require('./models/comment');
const Answer = require('./models/answers');


// Check if the admin credentials were provided as arguments
if (process.argv.length < 4) {
  console.error('Usage: node init.js <admin-username> <admin-password>');
  process.exit(1);
}

// Extract admin credentials from command line arguments
const adminUsername = process.argv[2];
const adminPassword = process.argv[3];

// Connect to your MongoDB database
mongoose.connect('mongodb://127.0.0.1:27017/fake_so', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createUser = async (username, password, email, isAdmin = false) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, email, isAdmin });
    return user.save();
  };
  
  const createTag = async (name) => {
    const tag = new Tag({ name });
    return tag.save();
  };
  
  const createQuestion = async (title, text, tags, askedBy) => {
    const question = new Question({ title, text, tags, asked_by: askedBy });
    return question.save();
  };
  
  const createComment = async (text, commentedBy) => {
    const comment = new Comment({ text, commented_by: commentedBy });
    return comment.save();
  };
  
  const createAnswer = async (text, answeredBy) => {
    const answer = new Answer({ text, ans_by: answeredBy });
    return answer.save();
  };

  const createTestData = async () => {
    try {
      // Create some test users
      await createUser('user1', 'password1', 'user1@example.com');
      await createUser('user2', 'password2', 'user2@example.com');
  
      // Create some tags
      const tag1 = await createTag('JavaScript');
      const tag2 = await createTag('MongoDB');
  
      // Create a question
      const question = await createQuestion('How to use MongoDB with Node.js?', 'I am new to MongoDB and Node.js. Can someone help?', [tag1, tag2], 'user1');
  
      // Create comments and answers
      await createComment('This is a great question!', 'user2');
      await createAnswer('You can use Mongoose with Node.js to interact with MongoDB.', 'user2');
  
      console.log('Test data created successfully.');
    } catch (error) {
      console.error('Error creating test data:', error);
    }
  };


// Create a new admin user profile
const createAdminProfile = async () => {
  try {
    // Check if an admin user with the provided username already exists
    const existingAdmin = await User.findOne({ username: adminUsername });

    if (existingAdmin) {
      console.error('Admin user already exists.');
      process.exit(1);
    }

    // Hash the admin password before saving it to the database
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create a new admin user
    const adminUser = new User({
      username: adminUsername,
      password: hashedPassword,
      email: 'admin@example.com',
      isAdmin :true,
      reputation:1000
    });

    // Save the admin user to the database
    await adminUser.save();

    console.log('Admin user profile created successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user profile:', error);
    process.exit(1);
  }
};

// Call the createAdminProfile function to create the admin user profile
createAdminProfile();