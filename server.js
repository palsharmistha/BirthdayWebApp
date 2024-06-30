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
    newStudent['Birthdate '] = formatDateForStorage(newStudent['Birthdate ']); // Format date on server

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



// Delete a student by Sr. No
app.delete('/api/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id, 10);

    fs.readFile('studentsDB.json', (err, data) => {
        if (err) {
            console.error('Error reading database:', err);
            res.status(500).send('Error reading database.');
            return;
        }
        let students = JSON.parse(data);
        const studentIndex = students.findIndex(student => student['Sr. No'] === studentId);

        if (studentIndex === -1) {
            res.status(404).send('Student not found');
            return;
        }

        students.splice(studentIndex, 1);

        fs.writeFile('studentsDB.json', JSON.stringify(students, null, 2), (err) => {
            if (err) {
                console.error('Error writing to database:', err);
                res.status(500).send('Error writing to database.');
                return;
            }
            res.status(200).send('Student deleted successfully');
        });
    });
});

function formatServerDate(inputDate) {
    const [day, month, year] = inputDate.split('-');
    const dateObject = new Date(year, getMonthNumber(month), day);
    const formattedDay = dateObject.getDate().toString().padStart(2, '0');
    const formattedMonth = dateObject.toLocaleString('default', { month: 'short' });
    const formattedYear = dateObject.getFullYear().toString().slice(-2);
    return `${formattedDay}-${formattedMonth}-${formattedYear}`;
}


function getMonthNumber(month) {
    const months = {
        '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
        '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
        '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };
    return months[month];
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
