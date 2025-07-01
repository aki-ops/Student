const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/student_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  fullName: String,
  password: String,
  role: String,
});

const User = mongoose.model('User', userSchema);

async function debugUsers() {
  try {
    const users = await User.find({});
    console.log('=== DEBUG USERS ===');
    console.log('Total users:', users.length);
    
    users.forEach((user, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log('  ID:', user._id);
      console.log('  Username:', user.username);
      console.log('  FullName:', user.fullName);
      console.log('  Role:', user.role);
      console.log('  Has fullName:', !!user.fullName);
      console.log('  fullName type:', typeof user.fullName);
    });
    
    const usersWithoutFullName = users.filter(u => !u.fullName);
    console.log('\n=== USERS WITHOUT FULLNAME ===');
    console.log('Count:', usersWithoutFullName.length);
    usersWithoutFullName.forEach(u => {
      console.log('  -', u.username, '(ID:', u._id, ')');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugUsers(); 