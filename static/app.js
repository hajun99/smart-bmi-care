const form = document.querySelector("#bmi-form");
const statusBadge = document.querySelector("#saved-status");
const historyList = document.querySelector("#history-list");
const clearHistoryButton = document.querySelector("#clear-history");
const chart = document.querySelector("#history-chart");
const chartContext = chart.getContext("2d");
const storageKey = "smart-bmi-care-history";

const activityLabels = {
  1.2: "거의 운동하지 않음",
  1.375: "주 1~3회",
  1.55: "주 3~5회",
  1.725: "주 6~7회",
  1.9: "매일 강도 높게 운동",
};

const fields = {
  bmi: document.querySelector("#bmi-value"),
  category: document.querySelector("#category-value"),
  calories: document.querySelector("#calorie-value"),
  bmiMessage: document.querySelector("#bmi-message"),
  riskMessage: document.querySelector("#risk-message"),
  exercise: document.querySelector("#exercise-text"),
  meal: document.querySelector("#meal-text"),
};

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(storageKey, JSON.stringify(history.slice(0, 12)));
}

async function requestCalculation(data) {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "계산에 실패했습니다.");
  }

  return result;
}

function updateResult(result) {
  fields.bmi.textContent = result.bmi;
  fields.category.textContent = result.category;
  fields.calories.textContent = `${result.calories.toLocaleString()} kcal`;
  fields.bmiMessage.textContent = `BMI ${result.bmi}는 '${result.category}'입니다.`;
  fields.riskMessage.textContent = result.risk;
  fields.exercise.textContent = result.exercise;
  fields.meal.textContent = result.meal;
  statusBadge.textContent = "저장됨";
  statusBadge.classList.add("is-saved");
}

function drawChart(history) {
  const width = chart.width;
  const height = chart.height;
  const padding = 46;

  chartContext.clearRect(0, 0, width, height);
  chartContext.fillStyle = "#fbfcfa";
  chartContext.fillRect(0, 0, width, height);

  chartContext.strokeStyle = "#dce5dd";
  chartContext.lineWidth = 1;
  [18.5, 25, 30, 35, 40].forEach((value) => {
    const y = mapValue(value, 15, 42, height - padding, padding);
    chartContext.beginPath();
    chartContext.moveTo(padding, y);
    chartContext.lineTo(width - padding, y);
    chartContext.stroke();
    chartContext.fillStyle = "#627064";
    chartContext.font = "14px sans-serif";
    chartContext.fillText(String(value), 12, y + 5);
  });

  if (!history.length) {
    chartContext.fillStyle = "#627064";
    chartContext.font = "20px sans-serif";
    chartContext.fillText("기록을 저장하면 그래프가 표시됩니다", padding, height / 2);
    return;
  }

  const points = history.slice().reverse().map((item, index, list) => {
    const x = list.length === 1 ? width / 2 : mapValue(index, 0, list.length - 1, padding, width - padding);
    const y = mapValue(item.bmi, 15, 42, height - padding, padding);
    return { x, y, ...item };
  });

  chartContext.strokeStyle = "#217a55";
  chartContext.lineWidth = 4;
  chartContext.beginPath();
  points.forEach((point, index) => {
    if (index === 0) chartContext.moveTo(point.x, point.y);
    else chartContext.lineTo(point.x, point.y);
  });
  chartContext.stroke();

  points.forEach((point) => {
    chartContext.fillStyle = "#ffffff";
    chartContext.strokeStyle = "#d96a4e";
    chartContext.lineWidth = 3;
    chartContext.beginPath();
    chartContext.arc(point.x, point.y, 7, 0, Math.PI * 2);
    chartContext.fill();
    chartContext.stroke();
  });
}

function mapValue(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function renderHistory() {
  const history = getHistory();

  if (!history.length) {
    historyList.innerHTML = '<p class="empty-state">아직 기록이 없습니다.</p>';
    drawChart([]);
    return;
  }

  historyList.innerHTML = history
    .map(
      (item) => `
        <article class="history-item">
          <strong>BMI ${item.bmi} / ${item.category}</strong>
          <span>${item.date} · ${item.weight}kg · ${item.calories.toLocaleString()}kcal · ${item.activityLabel}</span>
        </article>
      `,
    )
    .join("");
  drawChart(history);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(form);
  const data = {
    height: Number(formData.get("height")),
    weight: Number(formData.get("weight")),
    age: Number(formData.get("age")),
    gender: formData.get("gender"),
    activity: Number(formData.get("activity")),
  };

  try {
    const result = await requestCalculation(data);
    const historyItem = {
      ...result,
      height: data.height,
      weight: data.weight,
      age: data.age,
      gender: data.gender,
      activityLabel: activityLabels[data.activity],
      date: new Intl.DateTimeFormat("ko-KR", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date()),
    };

    const history = [historyItem, ...getHistory()];
    saveHistory(history);
    updateResult(result);
    renderHistory();
  } catch (error) {
    statusBadge.textContent = "오류";
    statusBadge.classList.remove("is-saved");
    fields.bmiMessage.textContent = error.message;
  }
});

form.addEventListener("reset", () => {
  window.setTimeout(() => {
    statusBadge.textContent = "저장 전";
    statusBadge.classList.remove("is-saved");
  }, 0);
});

clearHistoryButton.addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  renderHistory();
  statusBadge.textContent = "저장 전";
  statusBadge.classList.remove("is-saved");
});

renderHistory();s
