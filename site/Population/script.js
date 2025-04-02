let discipline = null;

$(document).ready(function() {
  discipline = getQueryParameterValue("discipline");
  if (!discipline) {
    window.location.href = "http://127.0.0.1:5500/site/Home";
  } else {
    fetchData(discipline);
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

function fetchData(discipline) {
  const apiURL = 'http://127.0.0.1:5000/get-all-students';
  const gradesUrl = 'http://127.0.0.1:5000/get-courses-per-discipline';

  $('.loader').removeClass('d-none');

  $.ajax({
    url: apiURL,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ discipline: discipline || null }),
    dataType: 'json',
    success: function(data) {
      updateStudentsTable(data.students);
      $('#population-title').text(`Population - ${discipline}`);
      $('.loader').addClass('d-none');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Error fetching data: ', textStatus, errorThrown);
      $('.loader').addClass('d-none');
    }
  });

  $.ajax({
    url: gradesUrl,
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify({ discipline: discipline || null }),
    dataType: 'json',
    success: function(data) {
      updateCourseTable(data.courses);
      $('.loader').addClass('d-none');
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.error('Error fetching data: ', textStatus, errorThrown);
      $('.loader').addClass('d-none');
    }
  });
}

const updateStudentsTable = (students) => {
  students.forEach(function(student) {
    const { first_name, intake_period, intake_year, last_name, passed, student_epita_email } = student;
    var newRow = `
      <tr>
        <td>${student_epita_email}</td>
        <td>${first_name}</td>
        <td>${last_name}</td>
        <td>${passed}</td>
        <td>${intake_period} - ${intake_year}</td>
      </tr>
    `;
    $('.table-responsive:first .table tbody').append(newRow);
  });
};

const updateCourseTable = (data) => {
  $.each(data, (index, item) => {
    const { course_name, duration, course_code } = item;
    const $row = $(`
      <tr class="hover">
        <td>${course_code}</td>
        <td>${course_name}</td>
        <td>${duration}</td>
      </tr>
    `);

    $row.on('click', () => {
      window.location.href = `/site/Grades/?courseCode=${course_code}&discipline=${discipline}&courseName=${course_name}`;
    });

    $('#course-content').append($row);
  });
};
