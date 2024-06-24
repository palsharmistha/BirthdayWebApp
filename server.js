const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Read existing students from JSON file
app.get('/api/students', (req, res) => {
    fs.readFile('studentsDB.json', (err, data) => {
        if (err) {
            console.error('Error reading database:', err);
            res.status(500).send('Error reading database.');
            return;
        }
        res.json(JSON.parse(data));
    });
});

// Add new student
app.post('/api/students', (req, res) => {
    const newStudent = req.body;
    newStudent['Birthdate '] = formatServerDate(newStudent['Birthdate ']); // Format date on server

    fs.readFile('studentsDB.json', (err, data) => {
        if (err) {
            res.status(500).send('Error reading database.');
            return;
        }
        const students = JSON.parse(data);

        // Auto-increment Sr. No
        newStudent['Sr. No'] = students.length > 0 ? students[students.length - 1]['Sr. No'] + 1 : 1;

        students.push(newStudent);

        fs.writeFile('studentsDB.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                res.status(500).send('Error writing to database.');
                return;
            }
            res.status(201).json(newStudent); // Send back the newly added student with updated Sr. No
        });
    });
});

function formatServerDate(inputDate) {
    const parts = inputDate.split('-');
    if (parts.length === 3) {
        const month = getMonthNumber(parts[1]);
        return `${parts[2]}-${month}-${parts[0]}`;
    }
    return inputDate;
}

function getMonthNumber(month) {
    const months = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
        'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
        'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    return months[month];
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
