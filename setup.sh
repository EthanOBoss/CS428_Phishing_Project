# Install MySQL
brew install mysql

# Start MySQL service
brew services start mysql

# Verify it's running
brew services list
# You should see mysql with status "started"

# Run the secure installation script
mysql_secure_installation
# Yes to all

# Run SQL file from command line
mysql -u root -p phishing_reports
mysql -u root -p phishing_reports < your_file.sql

#from backend folder
npm init -y
npm install express mysql2 cors dotenv

