'use strict';
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./quiz.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      score INTEGER DEFAULT 0,
      correct_answer INTEGER DEFAULT 0,
      avatar TEXT DEFAULT 'default-avatar.svg'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_text TEXT NOT NULL,
      option_a TEXT NOT NULL,
      option_b TEXT NOT NULL,
      option_c TEXT NOT NULL,
      option_d TEXT NOT NULL,
      correct_option TEXT NOT NULL,
      question_type TEXT DEFAULT 'mcq'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS player_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id INTEGER NOT NULL,
      question_id INTEGER NOT NULL,
      selected_option TEXT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      FOREIGN KEY (player_id) REFERENCES players(id),
      FOREIGN KEY (question_id) REFERENCES questions(id)
    )
  `);
});

// db.run(`
//   INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, question_type)
//   VALUES 
//     ('What does HTTP stand for?', 'HyperText Transfer Protocol', 'HighText Transfer Protocol', 'HyperTransfer Text Protocol', 'None of the above', 'HyperText Transfer Protocol', 'mcq'),
//     ('Which port is used for HTTPS?', '80', '22', '443', '21', '443', 'mcq'),
//     ('What is the main purpose of a firewall?', 'To speed up internet', 'To prevent unauthorized access', 'To manage bandwidth', 'To store cookies', 'To prevent unauthorized access', 'mcq'),
//     ('What does DNS stand for?', 'Domain Name System', 'Digital Network Service', 'Direct Name Server', 'Data Name Service', 'Domain Name System', 'mcq'),
//     ('Which one is a strong password?', 'password123', 'abcde', 'Qw!8$zY1', '123456', 'Qw!8$zY1', 'mcq'),
    
//     ('JavaScript is a compiled language.', 'True', 'False', '', '', 'False', 'tf'),
//     ('TCP is a connection-oriented protocol.', 'True', 'False', '', '', 'True', 'tf'),
//     ('Git is a programming language used for web development.', 'True', 'False', '', '', 'False', 'tf'),
//     ('HTML stands for HyperText Markup Language.', 'True', 'False', '', '', 'True', 'tf'),
//     ('The <script> tag is used to include CSS in HTML.', 'True', 'False', '', '', 'False', 'tf'),
//     ('C# supports multiple inheritance through classes.', 'True', 'False', '', '', 'False', 'tf')
// `, (err) => {
//   if (err) {
//     console.error(" Error inserting sample questions:", err.message);
//   } else {
//     console.log(" Sample questions inserted into the database.");
//   }
// });
db.run(`
  INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option, question_type) 
  VALUES
-- Easy MCQ
  ('What does “www” in a web address stand for?', 'Weird Wired Wonders', 'Web Work Wizard', 'Wild Web Window', 'World Wide Web', 'World Wide Web', 'mcq'),
  ('Which of the following is a programming language?', 'HTML', 'Java', 'Chrome', 'Excel', 'Java', 'mcq'),
  ('What is HTML used for?', 'Making images', 'Writing blog content', 'Giving structure to web pages', 'Tracking weather', 'Giving structure to web pages', 'mcq'),
  ('What is a “bug” in software development?', 'A virus', 'A small robot', 'A mistake or error in code', 'A type of data', 'A mistake or error in code', 'mcq'),
  ('Which of the following tells a computer how to do something step-by-step?', 'Settings', 'Troubleshooting', 'Design', 'Algorithm', 'Algorithm', 'mcq'),
  ('Which of these is used to add styles to web pages?', 'HTML', 'CSS', 'SQL', 'Java', 'CSS', 'mcq'),
  ('Which device is used to connect a computer to a network?', 'Mouse', 'Router', 'Keyboard', 'Monitor', 'Router', 'mcq'),
  ('Which one of these is a front-end technology?', 'MySQL', 'Node.js', 'React', 'MongoDB', 'React', 'mcq'),
  ('Which of these is a type of malware?', 'Firewall', 'Antivirus', 'Trojan', 'Compiler', 'Trojan', 'mcq'),
  ('What does CSS stand for?', 'Computer Styled Sheets', 'Cascading Style Sheets', 'Creative Style Syntax', 'Custom Script Styling', 'Cascading Style Sheets', 'mcq'),
  ('Which port does HTTP use by default?', '20', '443', '80', '22', '80', 'mcq'),

-- Medium MCQ
  ('Which of these is commonly used to style websites?', 'SQL', 'CSS', 'FTP', 'PNG', 'CSS', 'mcq'),
  ('What is the “back-end” of a website responsible for?', 'Choosing the font style', 'Handling user input and storing data', 'Drawing graphics', 'Making the website colorful', 'Handling user input and storing data', 'mcq'),
  ('Which of these is often used as a back-end programming language?', 'HTML', 'CSS', 'Python', 'Illustrator', 'Python', 'mcq'),
  ('What does “API” stand for in software development?', 'Application Process Interface', 'Automated Program Integration', 'Application Programming Interface', 'Advanced Project Innovation', 'Application Programming Interface', 'mcq'),
  ('What do we call someone who works on both front-end and back-end development?', 'Coder', 'UI designer', 'Full-stack developer', 'Debugger', 'Full-stack developer', 'mcq'),
  ('What does “responsiveness” mean in web development?', 'Responding quickly to clicks', 'Changing layout for all screen sizes', 'Restricting browsers', 'Fast loading speed', 'Changing layout for all screen sizes', 'mcq'),
  ('Which protocol is used for secure web browsing?', 'HTTP', 'FTP', 'SSH', 'HTTPS', 'HTTPS', 'mcq'),
  ('Which layer of the OSI model does IP operate on?', 'Application', 'Data Link', 'Network', 'Physical', 'Network', 'mcq'),
  ('What is the purpose of a firewall?', 'Boost speed', 'Prevent unauthorized access', 'Store passwords', 'Manage Wi-Fi', 'Prevent unauthorized access', 'mcq'),
  ('What does DNS stand for?', 'Digital Network System', 'Domain Name System', 'Device Naming Service', 'Data Network Structure', 'Domain Name System', 'mcq'),
  ('Which command is used to check network connectivity on Linux?', 'ping', 'ls', 'cp', 'mkdir', 'ping', 'mcq'),
  ('Which database language is used for querying data?', 'Python', 'Java', 'SQL', 'PHP', 'SQL', 'mcq'),
  ('Which of these is a cloud computing provider?', 'Windows', 'Git', 'AWS', 'Ubuntu', 'AWS', 'mcq'),
  ('Which language is commonly used for scripting in Linux?', 'C++', 'PowerShell', 'Bash', 'Java', 'Bash', 'mcq'),
  ('Which tool is commonly used to containerize applications?', 'Nginx', 'GitHub', 'Docker', 'Apache', 'Docker', 'mcq'),
  ('What does the sudo command do in Linux?', 'Starts a service', 'Gives superuser access', 'Shuts down the system', 'Lists files', 'Gives superuser access', 'mcq'),

-- Hard MCQ
  ('What is the primary purpose of Multi-Factor Authentication (MFA)?', 'Replaces passwords', 'Adds a second verification step', 'Speeds up login', 'Prevents all malware', 'Adds a second verification step', 'mcq'),
  ('What is an API used for in back-end development?', 'Animating buttons', 'Connecting to services', 'Drawing layouts', 'Uploading photos', 'Connecting to services', 'mcq'),
  ('Which method most securely stores passwords in web apps?', 'SHA-1 hashing with salt', 'AES-256 encryption', 'bcrypt with unique salt', 'Environment variables', 'bcrypt with unique salt', 'mcq'),
  ('Which hashing algorithm is secure for password storage?', 'MD5', 'bcrypt', 'SHA-1', 'ROT13', 'bcrypt', 'mcq'),
  ('What is the role of a Certificate Authority (CA)?', 'Scan for malware', 'Sign digital certificates', 'Host websites', 'Manage DNS', 'Sign digital certificates', 'mcq'),
  ('What type of attack intercepts communication between two parties?', 'Brute force', 'Phishing', 'Man-in-the-middle', 'DDoS', 'Man-in-the-middle', 'mcq'),
  ('Which protocol is used for sending email?', 'IMAP', 'SMTP', 'FTP', 'SSH', 'SMTP', 'mcq'),
  ('What is the main function of Active Directory?', 'Store passwords', 'Control user/device access', 'Host websites', 'Scan for malware', 'Control user/device access', 'mcq'),
  ('What is the difference between symmetric and asymmetric encryption?', 'Symmetric uses public key only', 'Asymmetric uses one key', 'Symmetric uses same key for both', 'They’re identical', 'Symmetric uses same key for both', 'mcq'),
  ('Which command lists running processes in Linux?', 'netstat', 'ps', 'top', 'ping', 'top', 'mcq'),
  ('What is the default port for SSH?', '21', '23', '80', '22', '22', 'mcq'),
  ('Which file format is used to store environment variables securely?', '.env', '.json', '.css', '.xml', '.env', 'mcq'),
  ('Which vulnerability allows attackers to inject malicious SQL?', 'XSS', 'SQL Injection', 'DDoS', 'CSRF', 'SQL Injection', 'mcq'),

-- Themed MCQ
  ('Which of these is the tech equivalent of yelling "Avengers, assemble!"?', 'Initializing an array', 'Compiling code', 'Running a script with dependencies', 'Opening Notepad', 'Running a script with dependencies', 'mcq'),
  ('Why shouldn’t you use “123456” as your password?', 'It unlocks The Matrix', 'It’s the default for all coffee machines', 'Hackers guess it in 0.2 seconds', 'It’s legally protected by Nicolas Cage', 'Hackers guess it in 0.2 seconds', 'mcq'),
  ('What’s a hacker most likely to do on vacation?', 'Swim with sharks', 'Phish', 'Ride a rollercoaster', 'Post cat memes', 'Phish', 'mcq'),
  ('If Gandalf ran a firewall, what would he say?', '“Thou shall pass”', '“Access granted, my friend”', '“You shall not pass!”', '“Ping me later”', '“You shall not pass!”', 'mcq'),
  ('What does a developer do when code won’t work and they’re out of coffee?', 'Sleep', 'Cry into the keyboard', 'Summon Stack Overflow', 'Switch careers', 'Summon Stack Overflow', 'mcq'),
  ('What is two-factor authentication (2FA) like in the real world?', 'Carrying ID and a secret handshake', 'Bringing snacks to a LAN party', 'Installing two mice', 'Turning your monitor on twice', 'Carrying ID and a secret handshake', 'mcq'),
  ('Which superhero would MOST likely use encryption?', 'Aquaman', 'Iron Man', 'Thor', 'Hulk', 'Iron Man', 'mcq'),
  ('Why is writing code at 3am often a bad idea?', 'The compiler is asleep', 'You risk summoning Clippy', 'Brain.exe crashes', 'Stack Overflow is offline', 'Brain.exe crashes', 'mcq'),
  ('What does “phishing” try to catch?', 'Trout', 'Your Netflix password', 'SpongeBob', 'Wifi signals', 'Your Netflix password', 'mcq'),
  ('Which of these best describes a “zero-day exploit”?', 'A bad day with zero coffee', 'A bug used before the patch exists', 'A glitch in The Matrix', 'Your first day at work', 'A bug used before the patch exists', 'mcq'),
  ('What is a “cookie” on the internet?', 'A type of malware', 'A browser data file', 'A secret agent', 'A web page style', 'A browser data file', 'mcq'),
  ('If the internet was a city, what would be the “firewall”?', 'City walls', 'A traffic cop', 'Internet cafes', 'Coffee shops', 'City walls', 'mcq'),

-- True/False questions
  ('HTML is a programming language.', 'True', 'False', '', '', 'False', 'tf'),
  ('CSS can be used to animate elements.', 'True', 'False', '', '', 'True', 'tf'),
  ('JavaScript makes web pages interactive.', 'True', 'False', '', '', 'True', 'tf'),
  ('A router is used to display web pages.', 'True', 'False', '', '', 'False', 'tf'),
  ('Git is used for version control.', 'True', 'False', '', '', 'True', 'tf'),
  ('A strong password should include letters, numbers, and symbols.', 'True', 'False', '', '', 'True', 'tf'),
  ('HTTPS is more secure than HTTP.', 'True', 'False', '', '', 'True', 'tf'),
  ('Incognito mode protects you from malware.', 'True', 'False', '', '', 'False', 'tf'),
  ('SQL stands for Secure Query Logic.', 'True', 'False', '', '', 'False', 'tf'),
  ('Clicking unknown links is a good security habit.', 'True', 'False', '', '', 'False', 'tf'),
  ('Phishing is a cyber attack that tricks people into revealing sensitive information.', 'True', 'False', '', '', 'True', 'tf'),
  ('Firewall blocks unauthorized access to a network.', 'True', 'False', '', '', 'True', 'tf'),
  ('Software updates help fix security vulnerabilities.', 'True', 'False', '', '', 'True', 'tf'),
  ('Using public Wi-Fi is always safe.', 'True', 'False', '', '', 'False', 'tf'),
  ('Malware can damage or steal your data.', 'True', 'False', '', '', 'True', 'tf'),
  ('Strong passwords should be changed regularly.', 'True', 'False', '', '', 'True', 'tf'),
  ('Two-factor authentication provides extra security.', 'True', 'False', '', '', 'True', 'tf'),
  ('Backups are important for data recovery.', 'True', 'False', '', '', 'True', 'tf'),
  ('A VPN hides your IP address.', 'True', 'False', '', '', 'True', 'tf'),
  ('Cookies are used to track users online.', 'True', 'False', '', '', 'True', 'tf')
`, (err) => {
  if (err) {
    console.error(" Error inserting sample questions:", err.message);
  } else {
    console.log(" Sample questions inserted into the database.");
  }
});


module.exports = db;
