let histogramChart = null;
let cumulativeChart = null;

function clearData() {
  document.getElementById("inputData").value = ""; // مسح بيانات الإدخال
  document.getElementById("classCount").value = ""; // مسح عدد الفئات
}

function processData() {
  let data = document
    .getElementById("inputData")
    .value.trim()
    .split(/\s+/)
    .map(Number);
  let InpueData = parseInt(document.getElementById("inputData").value);
  let classCount = parseInt(document.getElementById("classCount").value);

  if (
    data.length === 0 ||
    isNaN(classCount) ||
    classCount < 1 ||
    isNaN(InpueData) ||
    InpueData < 1
  ) {
    alert("Enter the data first!");
    return;
  }

  let min = Math.min(...data);
  let max = Math.max(...data);
  let range = max - min;
  let classWidth = Math.ceil(range / classCount);

  document.getElementById("minValue").innerText = min;
  document.getElementById("maxValue").innerText = max;
  document.getElementById("rangeValue").innerText = range;
  document.getElementById("classWidthEquation").innerText = `${(
    range / classCount
  ).toFixed(2)}`;

  document.getElementById("classWidthValue").innerText = classWidth;
  generateTable(min, max, classWidth, classCount, data);
}

// المعادلات
function generateTable(min, max, classWidth, classCount, data) {
  let tableBody = document.querySelector("#dataTable tbody");
  tableBody.innerHTML = "";

  let classes = [];
  let lower = min;

  for (let i = 0; i < classCount; i++) {
    let upper = lower + classWidth - 1;
    if (i === classCount) upper = max;

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
          label: "frequency",
          data: classes.map((c) => c.frequency),
          backgroundColor: "blue",
          borderColor: "blue",
          borderWidth: 1,
        },
        {
          label: "frequency (Line)",
          data: classes.map((c) => c.frequency),
          borderColor: "red",
          backgroundColor: "red",
          type: "line",
          borderWidth: 2,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Frequency" },
        },
        x: {
          title: { display: true, text: "Lenght" },
        },
      },
    },
  });
}
// الجدول الثالث
function drawLessThanTable(classes, data) {
  let tableBody = document.querySelector("#lessThanTable tbody");
  tableBody.innerHTML = "";
  let labels = [];
  let values = [];

  // الحصول على عدد الأرقام المدخلة
  let totalNumbers = data.length;
  if (totalNumbers === 0) return; // تجنب القسمة على صفر

  // إضافة فئة إضافية لجدول less than
  let extendedClasses = [
    ...classes,
    { lower: classes[classes.length - 1].upper },
  ];

  extendedClasses.forEach((c, index) => {
    let countLessThan = data.filter((value) => value < c.lower).length;

    // حساب النسبة التراكمية (القيمة ÷ إجمالي المدخلات)
    let relativeFrequency = countLessThan / totalNumbers;

    // عرض countLessThan في الجدول
    tableBody.innerHTML += `
            <tr>
                <td>${c.lower}</td>
                <td>${countLessThan}</td>
            </tr>
        `;

    labels.push(c.lower);
    values.push(relativeFrequency); // استخدام relativeFrequency فقط في الرسم البياني
  });

  drawCumulativeGraph(labels, values);
}

function drawCumulativeGraph(labels, values) {
  let ctx = document.getElementById("cumulativeChart").getContext("2d");
  if (cumulativeChart) cumulativeChart.destroy();

  cumulativeChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Relative Frequency",
          data: values, // استخدام relativeFrequency هنا
          borderColor: "red",
          backgroundColor: "red",
          fill: false,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 1, // ضبط المحور ليكون بين 0 و 1
          title: { display: true, text: "Relative Frequency" },
        },
        x: {
          title: { display: true, text: "Length" },
        },
      },
    },
  });
}

// المخطط الاول
let originalHistogramData = null;

function scaleCanvasOne() {
  let inputData = document.getElementById("inputData").value.trim();
  let classCount = parseInt(document.getElementById("classCount").value);

  if (inputData === "" || isNaN(classCount) || classCount < 1) {
    alert("Enter the data first!");
    return;
  }

  // حفظ بيانات المخطط الأصلي
  originalHistogramData = {
    labels: histogramChart.data.labels,
    datasets: histogramChart.data.datasets,
  };

  let fullScreenDiv = document.createElement("div");
  fullScreenDiv.classList.add("fullScreen");
  fullScreenDiv.id = "fullScreenChartContainer";

  let closeButton = document.createElement("button");
  closeButton.innerHTML =
    '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>';
  closeButton.classList.add("showCloseBtn");
  closeButton.onclick = () => zoomOut1(fullScreenDiv);

  let newCanvas = document.createElement("canvas");
  newCanvas.id = "fullScreenHistogramChart";

  fullScreenDiv.appendChild(closeButton);
  fullScreenDiv.appendChild(newCanvas);
  document.body.appendChild(fullScreenDiv);

  let ctx = newCanvas.getContext("2d");
  histogramChart.destroy(); // تدمير المخطط الأصلي قبل الرسم

  histogramChart = new Chart(ctx, {
    type: "bar",
    data: originalHistogramData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Frequency" },
        },
        x: { title: { display: true, text: "Length" } },
      },
    },
  });
}

function zoomOut1(fullScreenDiv) {
  fullScreenDiv.remove(); // إغلاق النافذة

  // إعادة رسم المخطط الأصلي
  let ctx = document.getElementById("histogramChart").getContext("2d");
  histogramChart.destroy(); // تدمير المخطط المكبّر

  // إعادة تعيين المخطط إلى وضعه الأصلي
  histogramChart = new Chart(ctx, {
    type: "bar",
    data: originalHistogramData,
    options: {
      responsive: true,
      maintainAspectRatio: true, // تأكيد الحفاظ على النسبة
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Frequency" },
        },
        x: { title: { display: true, text: "Length" } },
      },
    },
  });
  document.getElementById("histogramChart").classList.remove("fullScreen");
  document.getElementById("histogramChart").classList.add("canvas");
}

//   المخطط الثاني
let originalCumulativeData = null;

function scaleCanvasTwo() {
  let inputData = document.getElementById("inputData").value.trim();
  let classCount = parseInt(document.getElementById("classCount").value);

  if (inputData === "" || isNaN(classCount) || classCount < 1) {
    alert("Enter the data first!");
    return;
  }

  originalCumulativeData = {
    labels: cumulativeChart.data.labels,
    datasets: cumulativeChart.data.datasets,
  };

  let fullScreenDiv = document.createElement("div");
  fullScreenDiv.classList.add("fullScreen");
  fullScreenDiv.id = "fullScreenCumulativeChartContainer";

  let closeButton = document.createElement("button");
  closeButton.innerHTML =
    '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>';
  closeButton.classList.add("showCloseBtn");
  closeButton.onclick = () => zoomOut2(fullScreenDiv);

  let newCanvas = document.createElement("canvas");
  newCanvas.id = "fullScreenCumulativeChart";

  fullScreenDiv.appendChild(closeButton);
  fullScreenDiv.appendChild(newCanvas);
  document.body.appendChild(fullScreenDiv);

  let ctx = newCanvas.getContext("2d");
  cumulativeChart.destroy();

  cumulativeChart = new Chart(ctx, {
    type: "line",
    data: originalCumulativeData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Relative Frequency" },
        },
        x: { title: { display: true, text: "Lenght" } },
      },
    },
  });
}

function zoomOut2(fullScreenDiv) {
  fullScreenDiv.remove(); // إغلاق النافذة

  // إعادة رسم المخطط الأصلي
  let ctx = document.getElementById("cumulativeChart").getContext("2d");
  cumulativeChart.destroy(); // تدمير المخطط المكبّر

  // إعادة تعيين المخطط إلى وضعه الأصلي
  cumulativeChart = new Chart(ctx, {
    type: "line",
    data: originalCumulativeData,
    options: {
      responsive: true,
      maintainAspectRatio: true, // تأكيد الحفاظ على النسبة
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Relative Frequency" },
        },
        x: { title: { display: true, text: "Length" } },
      },
    },
  });
  document.getElementById("cumulativeChart").classList.remove("fullScreen");
  document.getElementById("cumulativeChart").classList.add("canvas");
}
