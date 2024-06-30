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
            <td>${student['Birthdate ']}</td>
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
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    if (!fromDate || !toDate) {
        return;
    }

    fetch('/api/students')
        .then(response => response.json())
        .then(students => {
            const filteredStudents = students.filter(student => {
                const dob = new Date(student['Birthdate ']);
                return (dob >= new Date(fromDate) && dob <= new Date(toDate));
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

    const srNo = Date.now();

    const newStudent = {
        "Sr. No": srNo,
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
        fetchStudents();
    })
    .catch(error => console.error('Error adding student:', error));
}

function formatDate(inputDate) {
    const date = new Date(inputDate);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString();
    return `${day}-${month}-${year}`;
}
