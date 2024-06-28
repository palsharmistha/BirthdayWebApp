
document.addEventListener('DOMContentLoaded', () => {
    // Fetch all students and display them
    fetch('/api/students')
        .then(response => response.json())
        .then(data => {
            displayAllStudents(data); // Display all students
            showBirthdayAlert(data); // Check for birthdays today
        })
        .catch(error => console.error('Error fetching students:', error));

    // Event listener for check button
    const checkButton = document.getElementById('checkButton');
    checkButton.addEventListener('click', checkBirthdays);

    // Event listener for add student form submission
    const addStudentForm = document.getElementById('addStudentForm');
    addStudentForm.addEventListener('submit', addNewStudent);

    // Initialize Flatpickr for date inputs
    flatpickr('#fromDate', {
        dateFormat: 'Y-m-d',
    });
    flatpickr('#toDate', {
        dateFormat: 'Y-m-d',
    });
});

function displayAllStudents(students) {
    const tableBody = document.getElementById('studentList');
    if (!tableBody) {
        console.error('Element with ID "studentList" not found.');
        return;
    }
    tableBody.innerHTML = ''; // Clear existing rows

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student['Students Name']}</td>
            <td>${student['Birthdate ']}</td>
            <td>${student['Contact No']}</td>
        `;
        tableBody.appendChild(row);
    });
}
function displayAllStudents(students) {
    const tableBody = document.getElementById('studentList');
    if (!tableBody) {
        console.error('Element with ID "studentList" not found.');
        return;
    }
    tableBody.innerHTML = ''; // Clear existing rows

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student['Sr. No']}</td>
            <td>${student['Students Name']}</td>
            <td>${student['Birthdate ']}</td>
            <td>${student['Contact No']}</td>
            <td>
                <button class="btn btn-sm delete-btn" aria-label="Delete" data-id="${student['Sr. No']}">
                    <img src="delete.png" alt="Delete">
                </button>
            </td>
        `;
        tableBody.appendChild(row);

        // Add event listener for delete button
        const deleteButton = row.querySelector('.delete-btn');
        deleteButton.addEventListener('click', () => {
            const studentId = student['Sr. No'];
            const confirmation = confirm(`Are you sure you want to delete ${student['Students Name']}?`);
            if (confirmation) {
                deleteStudent(studentId);
            }
        });
    });
}

function deleteStudent(studentId) {
    fetch(`/api/students/${studentId}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (response.ok) {
            alert('Student deleted successfully!');
            fetchStudents(); // Fetch updated list after deletion
        } else {
            throw new Error('Failed to delete student.');
        }
    })
    .catch(error => console.error('Error deleting student:', error));
}

function fetchStudents() {
    fetch('/api/students')
        .then(response => response.json())
        .then(data => {
            displayAllStudents(data); // Update table with new data
            showBirthdayAlert(data); // Update birthday alert if needed
        })
        .catch(error => console.error('Error fetching students:', error));
}

function showBirthdayAlert(students) {
    const today = new Date(); // Current date

    const studentsWithBirthdayToday = students.filter(student => {
        const dob = new Date(student['Birthdate ']);
        return (
            dob.getMonth() === today.getMonth() && // Same month
            dob.getDate() === today.getDate() // Same day
        );
    });

    if (studentsWithBirthdayToday.length > 0) {
        const studentNames = studentsWithBirthdayToday.map(student => student['Students Name']).join(', ');

        // Display on screen
        const birthdayList = document.getElementById('birthdayList');
        birthdayList.innerHTML = `<ul><li>${studentNames}</li></ul>`;
    }
}

function checkBirthdays(event) {
    event.preventDefault();
    const today = new Date(); // Current date

    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const studentsWithBirthdayToday = students.filter(student => {
                const dob = new Date(student['Birthdate ']);
                return (
                    dob.getMonth() === today.getMonth() && // Same month
                    dob.getDate() === today.getDate() // Same day
                );
            });

            if (studentsWithBirthdayToday.length > 0) {
                const studentNames = studentsWithBirthdayToday.map(student => student['Students Name']).join(', ');

                // Display on screen
                const birthdayList = document.getElementById('birthdayList');
                birthdayList.innerHTML = `<ul><li>${studentNames}</li></ul>`;
            } else {
                const birthdayList = document.getElementById('birthdayList');
                birthdayList.innerHTML = ''; // Clear list if no birthdays today
            }

            // Proceed to filter by date range as before (if needed)
            const fromDate = document.getElementById('fromDate').value;
            const toDate = document.getElementById('toDate').value;

            if (!fromDate || !toDate) {
                return; // Return if no date range is selected
            }

            const fromMonth = new Date(fromDate).getMonth(); // Get month index (0-11)
            const toMonth = new Date(toDate).getMonth(); // Get month index (0-11)

            const filteredStudents = students.filter(student => {
                const dob = new Date(student['Birthdate ']);
                const studentMonth = dob.getMonth(); // Get month index (0-11)

                // Compare only month and day (ignore year)
                return (
                    (studentMonth > fromMonth || (studentMonth === fromMonth && dob.getDate() >= new Date(fromDate).getDate())) &&
                    (studentMonth < toMonth || (studentMonth === toMonth && dob.getDate() <= new Date(toDate).getDate()))
                );
            });

            const resultList = document.getElementById('studentBirthdaysList');
            resultList.innerHTML = '';
            if (filteredStudents.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="4">No students have birthdays in this date range.</td>`;
                resultList.appendChild(row);
            } else {
                filteredStudents.forEach((student, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${student['Students Name']}</td>
                        <td>${student['Birthdate ']}</td>
                        <td>${student['Contact No']}</td>
                    `;
                    resultList.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error checking birthdays:', error));
}


function addNewStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const dob = formatDate(document.getElementById('studentDOB').value);
    const contact = document.getElementById('studentContact').value;

    const newStudent = { "Students Name": name, "Birthdate ": dob, "Contact No": contact };

    fetch('/api/students', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
    })
    .then(response => response.json())
    .then(student => {
        // Close the add student form
        const addStudentForm = document.getElementById('addStudentForm');
        addStudentForm.reset(); // Clear form fields
        addStudentForm.classList.remove('show'); // Hide the form

        // Fetch updated student list after successful addition
        fetch('/api/students')
            .then(response => response.json())
            .then(data => {
                displayAllStudents(data); // Update table with new data
                showBirthdayAlert(data); // Update birthday alert
            })
            .catch(error => console.error('Error fetching updated students:', error));
    })
    .catch(error => console.error('Error adding student:', error));
}


function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}
