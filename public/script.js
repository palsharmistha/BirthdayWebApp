document.addEventListener('DOMContentLoaded', () => {
    fetchStudents();

    const checkButton = document.getElementById('checkButton');
    checkButton.addEventListener('click', checkBirthdays);

    const addStudentForm = document.getElementById('addStudentForm');
    addStudentForm.addEventListener('submit', addNewStudent);

    flatpickr('#fromDate', { dateFormat: 'Y-m-d' });
    flatpickr('#toDate', { dateFormat: 'Y-m-d' });
});

function displayAllStudents(students) {
    const tableBody = document.getElementById('studentList');
    if (!tableBody) {
        console.error('Element with ID "studentList" not found.');
        return;
    }
    tableBody.innerHTML = '';

    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student['Students Name']}</td>
            <td>${formatDate(student['Birthdate '])}</td> <!-- Display formatted date -->
            <td>${student['Contact No']}</td>
            <td>
                <button class="btn btn-sm delete-btn" aria-label="Delete" data-id="${student['Sr. No']}">
                    <img src="delete.png" alt="Delete">
                </button>
            </td>
        `;
        tableBody.appendChild(row);

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
    fetch(`/api/students/${studentId}`, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                alert('Student deleted successfully!');
                fetchStudents();
            } else if (response.status === 404) {
                throw new Error('Student not found.');
            } else {
                throw new Error('Failed to delete student.');
            }
        })
        .catch(error => {
            console.error('Error deleting student:', error.message);
            alert('Failed to delete student. Please try again later.');
        });
}

function fetchStudents() {
    fetch('/api/students')
        .then(response => response.json())
        .then(data => {
            displayAllStudents(data);
            showBirthdayAlert(data);
        })
        .catch(error => console.error('Error fetching students:', error));
}

function showBirthdayAlert(students) {
    const today = new Date();
    const studentsWithBirthdayToday = students.filter(student => {
        const dob = new Date(student['Birthdate ']);
        return (dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate());
    });

    const birthdayList = document.getElementById('birthdayList');
    if (studentsWithBirthdayToday.length > 0) {
        const studentNames = studentsWithBirthdayToday.map(student => student['Students Name']).join(', ');
        birthdayList.innerHTML = `<ul><li>${studentNames}</li></ul>`;
    } else {
        birthdayList.innerHTML = '';
    }
}

function checkBirthdays(event) {
    event.preventDefault();
    const today = new Date(); // Current date

    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const studentsWithBirthdayToday = students.filter(student => {
                const dob = convertToDate(student['Birthdate ']); // Convert to Date object
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
                const dob = convertToDate(student['Birthdate ']);
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
                        <td>${formatDate(student['Birthdate '])}</td> <!-- Display formatted date -->
                        <td>${student['Contact No']}</td>
                    `;
                    resultList.appendChild(row);
                });
            }
        })
        .catch(error => console.error('Error checking birthdays:', error));
}
function convertToDate(inputDate) {
    // Check if the date is in "DD-Mon-YY" format
    if (/^\d{2}-[A-Za-z]{3}-\d{2}$/.test(inputDate)) {
        const parts = inputDate.split('-');
        const day = parseInt(parts[0], 10);
        const month = getMonthNumber(parts[1]);
        const year = parseInt(parts[2], 10) + 2000; // Convert to full year
        return new Date(year, month, day);
    } else {
        // Assume date is in "YYYY-MM-DD" format
        return new Date(inputDate);
    }
}

// Function to get month number from abbreviated month name
function getMonthNumber(month) {
    const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3,
        'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7,
        'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    return months[month];
}

function addNewStudent(event) {
    event.preventDefault();
    const name = document.getElementById('studentName').value;
    const dobInput = document.getElementById('studentDOB').value;
    const dob = formatDateForStorage(dobInput); // Format date for storage
    const contact = document.getElementById('studentContact').value;

    const newStudent = {
        "Students Name": name,
        "Birthdate ": dob,
        "Contact No": contact
    };

    fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent)
    })
    .then(response => response.json())
    .then(student => {
        const addStudentForm = document.getElementById('addStudentForm');
        addStudentForm.reset();
        $('#addStudentModal').modal('hide');
        fetchStudents(); // Refresh student list after adding
    })
    .catch(error => console.error('Error adding student:', error));
}

function formatDateForStorage(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`;
}

function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year
    return `${day}-${month}-${year}`;
}


function formatDateForComparison(inputDate) {
    const parts = inputDate.split('-');
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = getMonthNumber(parts[1]);
        const year = parseInt(parts[2], 10) + 2000; // Add 2000 to get full year
        return new Date(year, month, day);
    }
    return new Date(inputDate);
}

