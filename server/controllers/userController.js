const mysql = require('mysql');
const bcrypt = require('bcrypt');
// Connection Pool
let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});



// View Users
exports.view = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // If not logged in, redirect to login page
  }
  connection.query('SELECT * FROM student WHERE status = "active" LIMIT 5', (err, rows) => {
    
    if (!err) {
      let removedUser = req.query.removed;
      res.render('home', { rows, removedUser });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}


// View result
exports.views = (req, res) => {
  
   if (!req.session.userId) {
    return res.redirect('/login'); // If not logged in, redirect to login page
  }
  connection.query('SELECT DISTINCT id  FROM result ORDER BY id LIMIT 5', (err, rows) => {
    
    if (!err) {
      let removedUser = req.query.removed;
      res.render('result', { rows, removedUser });
    } else {
      console.log(err);
    }
    console.log('The data from result table: \n', rows);
  });
}

//View loggedinuser
// exports.userviews = (req, res) => {
//   if (!req.session.userId) {
//     return res.redirect('/login'); // If not logged in, redirect to login page
//   }
//   let searchTerm = req.body.search;
//   result = connection.query('SELECT DISTINCT id,username,email  FROM users ORDER BY id LIMIT 10', (err, rows) => {
//     //console.log(result);
    
//     if (!err) {
//       let removedUser = req.query.removed;
//       res.render('partials/user', { rows, removedUser });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from users table: \n', result);
//   });
// }

exports.userviews = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // If not logged in, redirect to login page
  }

  // Retrieve the search term from the query parameters or body
  let searchTerm = req.body.search || '';  // Default to empty string if no search term
  
  // Adjust the query to include search functionality if a search term is provided
  let query = 'SELECT DISTINCT id, username, email FROM users';
  
  // If there is a search term, add a WHERE clause to the query to filter users
  if (searchTerm) {
    query += ' WHERE username LIKE ? OR email LIKE ?';
  }
  
  query += ' ORDER BY id LIMIT 10';  // Limit to the first 10 results

  // Run the query
  connection.query(query, [ `%${searchTerm}%`, `%${searchTerm}%` ], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error fetching user data');
    }

    // Retrieve any query parameters (e.g., removedUser) to display messages
    let removedUser = req.query.removed;

    // Render the view, passing in the user data and any alert messages
    res.render('partials/user', { rows, removedUser });
  });
}


// Find User by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  
  connection.query('SELECT * FROM student WHERE id LIKE ? OR name LIKE ? OR gender LIKE ? OR department LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%',  '%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if(rows ==0 ){
      res.render('home', { alert: 'Student Not found.' });

    }
   else  if (!err) {
      res.render('home', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}

exports.finds = (req, res) => {
  let searchTerm = req.body.sr;
  
  connection.query('SELECT DISTINCT id FROM result WHERE id LIKE ?', ['%' + searchTerm + '%'  ], (err, rows) => {
    if(rows ==0 ){
      res.render('result', { alert: 'Result Not found.' });
    }
    else if (!err) {
      res.render('result', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from result table: \n', rows);
  });
}


// exports.finduser = (req, res) => {
//   let searchTerm = req.body.sr;
//   console.log({ searchTerm });

//   // Correct query with LIKE for both id and username
//   connection.query('SELECT * FROM users WHERE id LIKE ? OR username LIKE ? OR email LIKE ? or password LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%','%' + searchTerm + '%'], (err, rows) => {
//     // Handle error first
//     if (err) {
//       console.error('Error executing query:', err);  // Logs full error
//       return res.status(500).send('Server error. Please check the logs for more details.');
//     }

//     console.log('The data from result table: \n', rows);

//     // Check if no results were returned
//     if (rows.length === 0) {
//       res.render('partials/user', { alert: 'User not found.' });
//     } else {
//       res.render('partials/user', { rows });
//     }
//   });
// }

exports.finduser = (req, res) => {
  let searchTerm = req.body.sr;
  console.log({ searchTerm });

  // Check if searchTerm is empty or undefined
  if (!searchTerm || searchTerm.trim() === '') {
    return res.status(400).send('Search term is required');
  }

  // Trim whitespace and add % for partial match
  const searchPattern = '%' + searchTerm.trim() + '%'; 

  console.log('Search pattern with wildcards:', searchPattern);

  // Run the query to search for usernames matching the search term
  connection.query(
    'SELECT * FROM users WHERE username LIKE ?', 
    [searchPattern], 
    (err, rows) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).send('Server error. Please check the logs for more details.');
      }

      console.log('Rows returned from the query: \n', rows);

      // If no results, show alert message
      if (rows.length === 0) {
        res.render('partials/user', { alert: 'User not found.' });
      } else {
        res.render('partials/user', { rows });
      }
    }
  );
};






exports.form = (req, res) => {
  res.render('add-user');
}

// Add new user
exports.create = (req, res) => {
  const { id, name, batch, gender, department, phone, email } = req.body;
  let searchTerm = req.body.search;


  connection.query('INSERT INTO student SET id = ?, name = ?, batch = ?, gender = ?, department = ?, phone = ?, email = ?', [id, name, batch, gender, department, phone, email], (err, rows) => {
    if (!err) {
      res.render('add-user', { alert: 'Student added successfully.' });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}





exports.forms = (req, res) => {
  res.render('add-result');
}

// Add new result
exports.creates = (req, res) => {
  const { id, semester, cgpa } = req.body;
  let searchTerm = req.body.search;


  connection.query('INSERT INTO result SET id = ?, semester = ?, cgpa = ?', [id, semester, cgpa], (err, rows) => {
    if (!err) {
      res.render('add-result', { alert: 'Result added successfully.' });
    } else {
      console.log(err);
    }
    console.log('The data from result table: \n', rows);
  });
}

// exports.loginform = (req, res) => {
//   res.render('partials/login-form');
// }

// exports.usernew = (req, res) => {
//   const { id, username, email,password } = req.body;
//   //let searchTerm = req.body.search;


//   connection.query('INSERT INTO users SET id = ?, username = ?, email = ?,password=?', [id, username, email,password], (err, rows) => {
//     if (!err) {
//       res.render( { alert: 'User added successfully.' });
//     } else {
//       console.log(err);
//     }
//     console.log('The data from result table: \n', rows);
//   });
// }
// Render Login Form

exports.signupform = (req, res) => {
  res.render('partials/signup-form');  // Render your login page
};
exports.loginform = (req, res) => {
  res.render('partials/login-form');  // Render your login page
};



exports.logoutUser = (req, res) => {
 
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server Error');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/login');
    });

};

// Handle Login Logic (authentication)
// exports.loginUser = (req, res) => {
//   const { email, password } = req.body;

//   // Example query: Find user by email
//   connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).json({ message: 'Server error', error: err });
//     }

//     if (rows.length === 0) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Assuming you use bcrypt to compare passwords
//     bcrypt.compare(password, rows[0].password, (err, isMatch) => {
//       if (err) {
//         console.log(err);
//         return res.status(500).json({ message: 'Server error', error: err });
//       }

//       if (!isMatch) {
//         return res.status(400).json({ message: 'Invalid credentials' });
//       }

//       // If the password is correct, log the user in (set session, etc.)
//       req.session.user = rows[0];  // Store user data in the session
//       return res.status(200).json({
//         message: 'Login successful',
//         user: req.session.user, // Send user data back to the client
//       });
//     });
//   });
// };

// Assuming this is inside your login handler
exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and Password are required' });
  }

  // Query the database to find the user
  connection.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: 'Database error' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];

    // Use bcrypt or another hashing library to check the password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'Error comparing passwords' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Set session after successful login
      //req.session.userId = user.id; // Store user ID or any identifier in the session

      // Send success response
      // res.status(200).json({ message: 'Login successful', user: user });
      // res.redirect('/user');

      req.session.userId = user.id; // Store user ID or any identifier
      req.session.username = user.username; // Store other data as needed

      // Send a JSON response indicating login success
      return res.json({ 
        message: 'Login successful',
        redirectTo: '/user' // Include the redirect URL here
      }); // Ensu
    });
  });
}


exports.signupUser = (req, res) => {
  const { username, email, password } = req.body;
  
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password', error: err });
    }
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    // Simple email validation (basic check)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
  
    // Simple password validation
    if (password.length < 5) {
      return res.status(400).json({ message: 'Password must be at least 5 characters long' });
    }
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    connection.query(query, [username, email, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Error saving user to database', error: err });
      }
      console.log("User added successfully:", result);  
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};



// Edit user
exports.edituser = (req, res) => {

  connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('partials/edituser', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}

// Edit student
exports.edit = (req, res) => {

  connection.query('SELECT * FROM student WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}



exports.updateuser = (req, res) => {
  const { id, username,email,password } = req.body;

  connection.query('UPDATE users SET id = ?, username = ?,password = ?, email = ? WHERE id = ?', [ id, username,password,email, req.params.id], (err, rows) => {
    if (!err) {
      connection.query('SELECT * FROM users WHERE id = ?', [req.params.id], (err, rows) => { 
        if (!err) {
          res.render('partials/edituser', { rows,alert: `${username} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from user table: \n', rows);
      });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}


// Update User
exports.update = (req, res) => {
  const { id, name, batch, gender, department, phone, email } = req.body;
  
  connection.query('UPDATE student SET id = ?, name = ?, batch = ?, gender = ?, department = ?, phone = ?, email = ? WHERE id = ?', [ id, name, batch, gender, department, phone, email, req.params.id], (err, rows) => {
    if (!err) {
      connection.query('SELECT * FROM student WHERE id = ?', [req.params.id], (err, rows) => { 
        if (!err) {
          res.render('edit-user', { rows, alert: `${name} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from student table: \n', rows);
      });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}

exports.deleteuser = (req, res) => {

  connection.query('DELETE FROM users WHERE id = ?', [req.params.id], (err, rows) => {
    if(!err) {
      res.redirect('/user');
      //res.render('userviews', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from user table: \n', rows);
  });
}

// Delete User
exports.delete = (req, res) => {

  connection.query('DELETE FROM student WHERE id = ?', [req.params.id], (err, rows) => {
    if(!err) {
      res.redirect('/');
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });


  // Delete logged in user


  // Hide a record

  // connection.query('UPDATE student SET status = ? WHERE id = ?', ['removed', req.params.id], (err, rows) => {
  //   if (!err) {
  //     let removedUser = encodeURIComponent('Student successeflly removed.');
  //     res.redirect('/?removed=' + removedUser);
  //   } else {
  //     console.log(err);
  //   }
  //   console.log('The data from student table are: \n', rows);
  // });
}

// View Users
exports.viewall = (req, res) => {
  connection.query('SELECT * FROM student WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-user', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from student table: \n', rows);
  });
}


// View Results by id
exports.viewalls = (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // If not logged in, redirect to login page
  }

  

  // connection.query('SELECT * FROM student INNER JOIN result ON student.id = result.id WHERE student.id = ?', [req.params.id], (err, rows) => {
     //connection.query('SELECT * FROM student NATURAL JOIN result WHERE id = ? ORDER BY semester', [req.params.id], (err, rows) => {
      connection.query('SELECT * FROM student NATURAL JOIN result WHERE id = ? ORDER BY semester',[req.params.id], (err, rows) => {
    if (!err) {
      // console.log(req.rows);
      res.render('view-result', { rows });
    } else {
      console.log(err);
    }
    console.log('The data from result table: \n', rows);
  });
}
