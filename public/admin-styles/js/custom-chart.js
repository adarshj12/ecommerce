(function ($) {
    "use strict";


    /*Sale statistics Chart*/
    var graphData = JSON.parse(document?.getElementById('orderData')?.value);
    var countData = graphData.map(function (item) {
        return item.count;
    });


    if ($('#myChart').length) {
        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            type: 'line',

            data: {
                labels: graphData.map(function (item) {
                    return item.date;
                }),
                datasets: [{
                    label: 'Daily Orders',
                    tension: 0.3,
                    fill: true,
                    backgroundColor: 'rgba(44, 120, 220, 0.2)',
                    borderColor: 'rgba(44, 120, 220)',
                    data: countData
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Orders'
                        }
                    },
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Last 30 days'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            usePointStyle: true,
                        },
                    }
                }
            }
        });
    }
    /*Sale statistics Chart*/


    var categoryData = JSON.parse($('#categoryData').val());

    // Extract the category names and product counts into separate arrays
    var categoryNames = categoryData.map(function (item) {
        return item.name;
    });

    var productCounts = categoryData.map(function (item) {
        return item.products;
    });

    if ($('#myChart2').length) {
        var ctx = document.getElementById('myChart2').getContext('2d');
        var chart = new Chart(ctx, {
          type: 'bar',
      
          data: {
            labels: categoryNames,
            datasets: [{
              label: 'Product Counts',
              backgroundColor: 'rgba(44, 120, 220, 0.7)',
              borderColor: 'rgba(44, 120, 220)',
              data: productCounts
            }]
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Number of Products'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      }
      
      if ($('#myChart3').length) {
        var paymentModeData = JSON.parse($('#paymentModeData').val());
      
        var ctx = document.getElementById("myChart3").getContext('2d');
        var myChart = new Chart(ctx, {
          type: 'pie',
          data: {
            labels: paymentModeData.map(item => item._id),
            datasets: [{
              label: "Payment Modes",
              backgroundColor: ["#5897fb", "#7bcf86", "#ff9076", "#d595e5"],
              data: paymentModeData.map(item => item.count)
            }]
          },
          options: {
            plugins: {
              legend: {
                labels: {
                  usePointStyle: true,
                },
              }
            }
          }
        });
      }
      

})(jQuery);