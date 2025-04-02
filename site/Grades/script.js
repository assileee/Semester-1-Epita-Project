$(document).ready(function () {
  const courseCode = getQueryParameterValue("courseCode");
  const courseName = getQueryParameterValue("courseName");
  const discipline = getQueryParameterValue("discipline");
  const decodedName = decodeURIComponent(courseName?.replace(/\+/g, ' ') || '');
  const decodedString = decodeURIComponent(courseCode?.replace(/\+/g, ' ') || '');

  if (!courseCode || !discipline || !courseName) {
    window.location.href = "http://127.0.0.1:5500/site/Home";
  } else {
    $("#title").text(`Student - Grade List for ${decodedName} ${discipline} `);
    fetchData(decodedString, discipline);
  }
});

const getQueryParameterValue = (parameterName) => {
  var url = window.location.href;
  var questionMarkIndex = url.indexOf("?");
  if (questionMarkIndex !== -1) {
    var queryString = url.substring(questionMarkIndex + 1);
    var queryParams = queryString.split("&");
    for (var i = 0; i < queryParams.length; i++) {
      var pair = queryParams[i].split("=");
      if (pair[0] === parameterName) {
        return pair[1];
      }
    }
  }

  return null;
};

const extractNamesFromEmail = (email) => {
  var parts = email.split('@')[0].split('.');
  var firstName = parts[0];
  var lastName = parts[1];
  return { firstName: firstName, lastName: lastName };
};

const updateStudentsTable = (data) => {
  $.each(data, function (index, course) {
    const { student_epita_email, course_name, average_grade } = course;
    const { student_population_year_ref, student_population_period_ref } = course;
    var newRow = `
        <tr>
            <td>${student_epita_email}</td>
            <td>${extractNamesFromEmail(student_epita_email).firstName}</td>
            <td>${extractNamesFromEmail(student_epita_email).lastName}</td>
            <td>${course_name}</td>
            <td>${parseFloat(average_grade).toFixed(2)}</td>
            <td>${student_population_year_ref}</td>
            <td>${student_population_period_ref}</td>
        </tr>`;

    $("#student-grades").append(newRow);
  });
};

function fetchData(courseCode, discipline) {
  const apiURL = 'http://127.0.0.1:5000/get-students-grades-per-course';

  $('.loader').removeClass('d-none');

  $.ajax({
    url: apiURL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ courseCode: courseCode || null, discipline: discipline || null }),
    dataType: 'json',
    success: function (data) {
      updateStudentsTable(data.courses);
      $('.loader').addClass('d-none');
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching data: ', textStatus, errorThrown);
      $('.loader').addClass('d-none');
    }
  });
}
