let histogramChart = null;
      let cumulativeChart = null;

      function processData() {
        let data = document
          .getElementById("inputData")
          .value.trim()
          .split(/\s+/)
          .map(Number);
        let classCount = parseInt(document.getElementById("classCount").value);

        if (data.length === 0 || isNaN(classCount) || classCount < 1) {
          alert("الرجاء إدخال بيانات صحيحة!");
          return;
        }

        let min = Math.min(...data);
        let max = Math.max(...data);
        let range = max - min;
        let classWidth = Math.ceil(range / classCount);
        
        document.getElementById("minValue").innerText = min;
        document.getElementById("maxValue").innerText = max;
        document.getElementById("rangeValue").innerText = range;
        document.getElementById(
          "classWidthEquation"
        ).innerText = `${range} ÷ ${classCount} = ${(
          range / classCount
        ).toFixed(2)}`;
        document.getElementById("classWidthValue").innerText = classWidth;

        generateTable(min, max, classWidth, classCount, data);
      }

      function generateTable(min, max, classWidth, classCount, data) {
        let tableBody = document.querySelector("#dataTable tbody");
        tableBody.innerHTML = "";

        let classes = [];
        let lower = min;

        for (let i = 0; i < classCount; i++) {
          let upper = lower + classWidth - 1;
          if (i === classCount - 1) upper = max;

          let mark = (lower + upper) / 2;
          let frequency = data.filter(
            (value) => value >= lower && value <= upper
          ).length;

          classes.push({ lower, upper, mark, frequency });

          tableBody.innerHTML += `
            <tr>
                <td>C${i + 1}</td>
                <td>${lower}</td>
                <td>${upper}</td>
                <td>${mark}</td>
                <td>${frequency}</td>
            </tr>
        `;

          lower += classWidth;
        }

        drawHistogram(classes);
        drawLessThanTable(classes, data);
      }

      function drawHistogram(classes) {
        let ctx = document.getElementById("histogramChart").getContext("2d");
        if (histogramChart) histogramChart.destroy();

        histogramChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: classes.map((c) => c.mark),
            datasets: [
            {
                label: "التكرار",
                data: classes.map((c) => c.frequency),
                type: "line",
                backgroundColor: "red",
                borderColor: "red",
                borderWidth: 1,
              },
              {
                label: "التكرار",
                data: classes.map((c) => c.frequency),
                backgroundColor: "blue",
                borderColor: "blue",
                borderWidth: 1,
              },
              
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }

      function drawLessThanTable(classes, data) {
        let tableBody = document.querySelector("#lessThanTable tbody");
        tableBody.innerHTML = "";

        let labels = [];
        let values = [];

        classes.forEach((c) => {
          let countLessThan = data.filter((value) => value < c.lower).length;

          tableBody.innerHTML += `
            <tr>
                <td>${c.lower}</td>
                <td>${countLessThan}</td>
            </tr>
        `;

          labels.push(c.lower);
          values.push(countLessThan);
        });

        drawCumulativeGraph(labels, values, data.length); // تمرير عدد البيانات
      }

      function drawCumulativeGraph(labels, values, numberOfData) {
        let ctx = document.getElementById("cumulativeChart").getContext("2d");
        if (cumulativeChart) cumulativeChart.destroy();

        let cumulativeValues = [];
        let cumulativeSum = 0;
        for (let i = 0; i < values.length; i++) {
          cumulativeSum += values[i];
          cumulativeValues.push(cumulativeSum);
        }

        cumulativeChart = new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [
              {
                label: "التكرار التراكمي",
                data: cumulativeValues,
                borderColor: "red",
                backgroundColor: "red",
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }