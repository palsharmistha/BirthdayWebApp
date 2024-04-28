function isToday(someDate) {
  const today = new Date();
  const dd = today.getDate();
  const mm = today.getMonth() + 1; // January is 0

  // Parse the date string from the JSON file
  const parts = someDate.split('-');
  const day = parseInt(parts[0], 10);
  const monthAbbreviation = parts[1];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames.indexOf(monthAbbreviation) + 1;

  // Check if the parsed date matches today's date (day and month)
  return day === dd && month === mm;
}

function displayBirthdayAlert(studentsWithBirthdayToday) {
  const alertMessage = studentsWithBirthdayToday.length > 0 ?
    `Today is the birthday of: ${studentsWithBirthdayToday.map(student => student['Students Name']).join(', ')}` :
    "No students have birthdays today.";

  // Display alert box
  alert(alertMessage);

  // Display message on the screen
  const birthdayList = document.getElementById('birthdayList');
  if (studentsWithBirthdayToday.length === 0) {
    const li = document.createElement('li');
    li.textContent = "No students have birthdays today.";
    birthdayList.appendChild(li);
  }
}

fetch('studentsDB.json')
  .then(response => response.json())
  .then(data => {
    const studentsWithBirthdayToday = data.filter(student => {
      const dob = student['Birthdate ']; // Assuming dob is in the format "dd-Mmm-yy"
      return isToday(dob);
    });

    // Display names in an alert box for students with birthdays today
    displayBirthdayAlert(studentsWithBirthdayToday);

    // Display students with birthdays today in the separate list
    const birthdayList = document.getElementById('birthdayList');
    studentsWithBirthdayToday.forEach(student => {
      const li = document.createElement('li');
      li.textContent = student['Students Name'];
      birthdayList.appendChild(li);
    });

    // Display all student names and dates of birth in a table
    const studentTableBody = document.getElementById('studentList');
    data.forEach((student, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${student['Students Name']}</td>
        <td>${student['Birthdate ']}</td>
      `;
      studentTableBody.appendChild(row);
    });
  })
  .catch(error => console.error('Error loading students data:', error));
//search function
function displaySelectedDateStudents(selectedDate, studentsWithBirthday) {
  const selectedDateHeading = document.getElementById('selectedDateHeading');
  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  selectedDateHeading.textContent = `Birthdays on ${selectedDateFormatted}:`;

  const selectedDateStudentList = document.getElementById('selectedDateStudentList');
  selectedDateStudentList.innerHTML = ''; // Clear previous content
  
  if (studentsWithBirthday.length > 0) {
    studentsWithBirthday.forEach(student => {
      const li = document.createElement('li');
      li.textContent = student['Students Name'];
      selectedDateStudentList.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = "No birthdays on the selected date.";
    selectedDateStudentList.appendChild(li);
  }
}

function checkBirthdays(selectedDate) {
  if (!selectedDate) {
    alert("Please select a date.");
    return;
  }

  const selectedDateObj = new Date(selectedDate);
  const selectedDay = selectedDateObj.getDate();
  const selectedMonth = selectedDateObj.getMonth() + 1; // January is 0

  fetch('studentsDB.json')
    .then(response => response.json())
    .then(data => {
      const studentsWithSelectedBirthday = data.filter(student => {
        const dob = student['Birthdate ']; // Assuming dob is in the format "dd-Mmm-yy"
        const parts = dob.split('-');
        const day = parseInt(parts[0], 10);
        const monthAbbreviation = parts[1];
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames.indexOf(monthAbbreviation) + 1;
        return day === selectedDay && month === selectedMonth;
      });

      displaySelectedDateStudents(selectedDate, studentsWithSelectedBirthday);
    })
    .catch(error => console.error('Error loading students data:', error));
}

document.getElementById('selectedDate').addEventListener('change', function() {
    const selectedDate = this.value;
    checkBirthdays(selectedDate);
});
