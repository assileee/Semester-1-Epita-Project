$(document).ready(function () {
  fetchData();
});

const displayPieChart = (toPlot) => {
  const labels = toPlot.map(item => `${item.student_population_code_ref} - ${item.student_population_period_ref}${item.student_population_year_ref}`);
  const data = toPlot.map(item => item.student_count);
  var ctx = document.getElementById('myPieChart').getContext('2d');
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        label: 'Population',
        data: data,
        backgroundColor: [
          '#8e44ad', 
          '#3498db', 
          '#e74c3c', 
          '#f1c40f', 
          '#2ecc71', 
        ],
        borderColor: [
          '#8e44ad',
          '#3498db',
          '#e74c3c',
          '#f1c40f',
          '#2ecc71',
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

const displayBarChart = (toPlot) => {
  var labels = toPlot.map(item => item.program_assignment);
  var values = toPlot.map(item => parseFloat(item.PresencePercentage));
  var ctx = document.getElementById('horizontalBarChart').getContext('2d');

  var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Presence Percentage',
        data: values,
        backgroundColor: '#16a085',
        borderColor: '#16a085',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    }
  });
}

const convertToAggregatedStudents = (students) => {
  const aggregatedStudents = {};
  students.forEach(student => {
    const key = student.student_population_code_ref;
    if (aggregatedStudents[key]) {
      aggregatedStudents[key].student_count += student.student_count;
    } else {
      aggregatedStudents[key] = {
        student_population_code_ref: student.student_population_code_ref,
        student_count: student.student_count
      };
    }
  });
  return Object.values(aggregatedStudents);
}

const fetchData = () => {
  const population = 'http://127.0.0.1:5000/get-population-data';
  const attendance = 'http://127.0.0.1:5000/get-all-attendance';

  $('.loader').removeClass('d-none');

  $.ajax({
    url: population,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const data = response.students;
      const aggregatedStudents = convertToAggregatedStudents(data)

      $('.list-group').empty();

      $.each(aggregatedStudents, function (index, item) {
        const content = `${item.student_population_code_ref} - (${item.student_count})`;
        $('<li>', {
          'class': 'list-group-item hover',
          'text': content,
          'click': () => {
            window.location.href = `/site/Population/?discipline=${item.student_population_code_ref}`;
          }
        }).appendTo($('.list-group-population'));
      });

      displayPieChart(data)
      $('.loader').addClass('d-none');
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching data: ', textStatus, errorThrown);
      $('.loader').addClass('d-none');
    }
  });

  $.ajax({
    url: attendance,
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      const data = response.attendance;

      $('.list-group').empty();

      $.each(data, function (index, item) {
        const content = `${item.program_assignment} - ${item.PresencePercentage}%`;
        $('<li>', {
          'class': 'list-group-item',
          'text': content
        }).appendTo($('.list-group-attendance'));
      });

      displayBarChart(data)
      $('.loader').addClass('d-none');
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error('Error fetching data: ', textStatus, errorThrown);
      $('.loader').addClass('d-none');
    }
  });
}
