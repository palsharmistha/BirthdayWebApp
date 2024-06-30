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
    const parts = inputDate.split('-');
    if (parts.length === 3) {
        const day = parts[0];
        const month = getMonthNumber(parts[1]);
        const year = `20${parts[2]}`; // Assuming 20YY format for years
        return `${year}-${month}-${day}`;
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
