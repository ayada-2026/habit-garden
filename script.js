const STORAGE_KEY = "habitGardenStateV1";

const PALETTES = {
  sunset: {
    accent: "#d86d57",
    soft: "#ffe0d6",
    border: "rgba(216, 109, 87, 0.24)",
    shadow: "rgba(216, 109, 87, 0.22)"
  },
  mint: {
    accent: "#4f9c8b",
    soft: "#dbf4ed",
    border: "rgba(79, 156, 139, 0.24)",
    shadow: "rgba(79, 156, 139, 0.22)"
  },
  citrus: {
    accent: "#c08a18",
    soft: "#fff0c5",
    border: "rgba(192, 138, 24, 0.24)",
    shadow: "rgba(192, 138, 24, 0.2)"
  },
  berry: {
    accent: "#ad5f84",
    soft: "#f4dce8",
    border: "rgba(173, 95, 132, 0.24)",
    shadow: "rgba(173, 95, 132, 0.22)"
  }
};

const habitForm = document.getElementById("habitForm");
const habitEmojiInput = document.getElementById("habitEmoji");
const habitNameInput = document.getElementById("habitName");
const habitNoteInput = document.getElementById("habitNote");
const habitColorInput = document.getElementById("habitColor");
const habitList = document.getElementById("habitList");
const emptyState = document.getElementById("emptyState");
const todayLabel = document.getElementById("todayLabel");
const activeCount = document.getElementById("activeCount");
const doneTodayCount = document.getElementById("doneTodayCount");
const strongestStreak = document.getElementById("strongestStreak");
const weeklyRate = document.getElementById("weeklyRate");
const insightTitle = document.getElementById("insightTitle");
const insightText = document.getElementById("insightText");
const weekOverview = document.getElementById("weekOverview");
const presetButtons = Array.from(document.querySelectorAll(".preset-chip"));

let habits = loadHabits();

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((habit) => ({
        id: typeof habit.id === "number" ? habit.id : Date.now() + Math.random(),
        name: typeof habit.name === "string" ? habit.name.trim() : "",
        note: typeof habit.note === "string" ? habit.note.trim() : "",
        emoji: typeof habit.emoji === "string" && habit.emoji.trim() ? habit.emoji.trim() : "🌿",
        color: PALETTES[habit.color] ? habit.color : "sunset",
        createdAt: typeof habit.createdAt === "string" ? habit.createdAt : getDateKey(new Date()),
        completedDates: normalizeDateList(habit.completedDates)
      }))
      .filter((habit) => habit.name);
  } catch (error) {
    return [];
  }
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function normalizeDateList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item) => typeof item === "string"))].sort();
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  }).format(date);
}

function getStartOfWeek(date) {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

function getWeekDates() {
  const start = getStartOfWeek(new Date());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function isHabitDoneOn(habit, dateKey) {
  return habit.completedDates.includes(dateKey);
}

function getCurrentStreak(habit) {
  if (!habit.completedDates.length) {
    return 0;
  }

  const completedSet = new Set(habit.completedDates);
  let cursor = parseDateKey(habit.completedDates[habit.completedDates.length - 1]);
  let streak = 0;

  while (completedSet.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWeeklyCount(habit) {
  return getWeekDates().filter((date) => (
    parseDateKey(habit.createdAt) <= date && isHabitDoneOn(habit, getDateKey(date))
  )).length;
}

function getLastDoneText(habit) {
  if (!habit.completedDates.length) {
    return "아직 체크 전";
  }

  const lastDone = parseDateKey(habit.completedDates[habit.completedDates.length - 1]);
  return `${formatShortDate(lastDone)} 완료`;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric"
  }).format(date);
}

function addHabit({ emoji, name, note, color }) {
  const trimmedName = name.trim();
  const trimmedNote = note.trim();

  if (!trimmedName) {
    habitNameInput.focus();
    return;
  }

  habits = [
    {
      id: Date.now(),
      name: trimmedName,
      note: trimmedNote,
      emoji: emoji.trim() || "🌿",
      color,
      createdAt: getDateKey(new Date()),
      completedDates: []
    },
    ...habits
  ];

  saveHabits();
  render();
  habitForm.reset();
  habitEmojiInput.focus();
}

function toggleHabitToday(habitId) {
  const todayKey = getDateKey(new Date());

  habits = habits.map((habit) => {
    if (habit.id !== habitId) {
      return habit;
    }

    const completedDates = new Set(habit.completedDates);
    if (completedDates.has(todayKey)) {
      completedDates.delete(todayKey);
    } else {
      completedDates.add(todayKey);
    }

    return {
      ...habit,
      completedDates: [...completedDates].sort()
    };
  });

  saveHabits();
  render();
}

function deleteHabit(habitId) {
  const target = habits.find((habit) => habit.id === habitId);
  if (!target) {
    return;
  }

  const shouldDelete = window.confirm(`"${target.name}" 습관을 삭제할까요?`);
  if (!shouldDelete) {
    return;
  }

  habits = habits.filter((habit) => habit.id !== habitId);
  saveHabits();
  render();
}

function getSummary() {
  const today = new Date();
  const todayKey = getDateKey(today);
  const active = habits.length;
  const doneToday = habits.filter((habit) => isHabitDoneOn(habit, todayKey)).length;
  const streaks = habits.map(getCurrentStreak);
  const strongest = streaks.length ? Math.max(...streaks) : 0;

  const weekDates = getWeekDates().filter((date) => date <= today);
  let totalPossible = 0;
  let totalDone = 0;

  habits.forEach((habit) => {
    weekDates.forEach((date) => {
      if (parseDateKey(habit.createdAt) <= date) {
        totalPossible += 1;
        if (isHabitDoneOn(habit, getDateKey(date))) {
          totalDone += 1;
        }
      }
    });
  });

  const weeklyPercent = totalPossible ? Math.round((totalDone / totalPossible) * 100) : 0;

  return {
    active,
    doneToday,
    strongest,
    weeklyPercent
  };
}

function getInsight(summary) {
  if (!summary.active) {
    return {
      title: "씨앗을 심어볼 시간이에요",
      body: "작게 시작해도 괜찮아요. 오늘 반복하고 싶은 행동 하나만 적어도 충분합니다."
    };
  }

  if (summary.doneToday === summary.active) {
    return {
      title: "오늘 정원을 모두 돌봤어요",
      body: "지금 페이스가 좋아요. 내일도 같은 시간에 짧게 이어가면 흐름이 더 단단해집니다."
    };
  }

  if (summary.strongest >= 7) {
    return {
      title: `${summary.strongest}일 흐름이 이어지고 있어요`,
      body: "일주일 이상 이어진 습관이 생겼어요. 오늘 체크 몇 개만 더 채우면 정원이 더 선명해집니다."
    };
  }

  if (summary.doneToday === 0) {
    return {
      title: "오늘의 첫 체크를 기다리고 있어요",
      body: "가장 쉬운 습관 하나부터 눌러보세요. 첫 체크가 나머지 행동을 끌어주는 경우가 많아요."
    };
  }

  return {
    title: "좋은 리듬이 만들어지고 있어요",
    body: `${summary.doneToday}개의 습관이 오늘 체크됐어요. 남은 카드도 가볍게 마무리해볼까요?`
  };
}

function renderSummary() {
  const summary = getSummary();
  activeCount.textContent = String(summary.active);
  doneTodayCount.textContent = String(summary.doneToday);
  strongestStreak.textContent = `${summary.strongest}일`;
  weeklyRate.textContent = `${summary.weeklyPercent}%`;

  const insight = getInsight(summary);
  insightTitle.textContent = insight.title;
  insightText.textContent = insight.body;
}

function renderWeekOverview() {
  const weekDates = getWeekDates();
  const today = new Date();
  const todayKey = getDateKey(today);
  const weekdayFormatter = new Intl.DateTimeFormat("ko-KR", { weekday: "short" });

  weekOverview.innerHTML = "";

  weekDates.forEach((date) => {
    const dateKey = getDateKey(date);
    const isFuture = date > today;
    const activeHabitsForDay = habits.filter((habit) => parseDateKey(habit.createdAt) <= date);
    const doneCount = activeHabitsForDay.filter((habit) => isHabitDoneOn(habit, dateKey)).length;
    const ratio = activeHabitsForDay.length ? Math.round((doneCount / activeHabitsForDay.length) * 100) : 0;

    const item = document.createElement("li");
    item.className = "week-pill";
    if (dateKey === todayKey) {
      item.classList.add("is-today");
    }

    item.innerHTML = `
      <span class="week-day">${weekdayFormatter.format(date)}</span>
      <strong class="week-ratio">${isFuture ? "예정" : `${doneCount}/${activeHabitsForDay.length || 0}`}</strong>
      <span class="week-track" aria-hidden="true">
        <span class="week-fill" style="height: ${isFuture ? 14 : ratio}%;"></span>
      </span>
      <span class="week-caption">${isFuture ? "기록 전" : `${ratio}%`}</span>
    `;

    weekOverview.appendChild(item);
  });
}

function createMiniWeek(habit) {
  const weekDates = getWeekDates();
  const todayKey = getDateKey(new Date());
  const fragment = document.createDocumentFragment();

  weekDates.forEach((date) => {
    const dateKey = getDateKey(date);
    const day = document.createElement("li");
    day.className = "mini-day";

    if (dateKey > todayKey) {
      day.classList.add("is-future");
    }

    if (dateKey === todayKey) {
      day.classList.add("is-today");
    }

    if (parseDateKey(habit.createdAt) <= date && isHabitDoneOn(habit, dateKey)) {
      day.classList.add("is-done");
    }

    const label = new Intl.DateTimeFormat("ko-KR", { weekday: "narrow" }).format(date);
    const canExist = parseDateKey(habit.createdAt) <= date;
    const mark = !canExist ? "·" : isHabitDoneOn(habit, dateKey) ? "완" : " ";

    day.innerHTML = `
      <span class="mini-day-label">${label}</span>
      <span class="mini-day-mark">${mark}</span>
    `;

    fragment.appendChild(day);
  });

  return fragment;
}

function createHabitCard(habit) {
  const palette = PALETTES[habit.color] || PALETTES.sunset;
  const todayKey = getDateKey(new Date());
  const todayDone = isHabitDoneOn(habit, todayKey);
  const streak = getCurrentStreak(habit);
  const weeklyCount = getWeeklyCount(habit);
  const item = document.createElement("li");

  item.className = "habit-card";
  item.style.setProperty("--habit-accent", palette.accent);
  item.style.setProperty("--habit-soft", palette.soft);
  item.style.setProperty("--habit-border", palette.border);
  item.style.setProperty("--habit-shadow", palette.shadow);

  item.innerHTML = `
    <div class="habit-top">
      <div class="habit-title-wrap">
        <div class="habit-icon" aria-hidden="true">${habit.emoji}</div>
        <div>
          <h3 class="habit-name">${habit.name}</h3>
          <p class="habit-note">${habit.note || "작게라도 반복하면 리듬이 만들어져요."}</p>
        </div>
      </div>
      <span class="streak-badge">${streak}일 연속</span>
    </div>
    <div class="habit-meta">
      <span class="meta-pill">이번 주 ${weeklyCount}회 체크</span>
      <span class="meta-pill">${getLastDoneText(habit)}</span>
    </div>
  `;

  const miniWeek = document.createElement("ul");
  miniWeek.className = "mini-week";
  miniWeek.setAttribute("aria-label", `${habit.name} 최근 일주일 기록`);
  miniWeek.appendChild(createMiniWeek(habit));
  item.appendChild(miniWeek);

  const bottom = document.createElement("div");
  bottom.className = "habit-bottom";

  const status = document.createElement("p");
  status.className = "habit-note";
  status.textContent = todayDone ? "오늘은 이미 체크했어요. 멋진 흐름이에요." : "오늘 아직 체크 전이에요.";

  const actions = document.createElement("div");
  actions.className = "habit-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = "secondary-button";
  if (todayDone) {
    toggleButton.classList.add("is-done");
  }
  toggleButton.setAttribute("aria-pressed", todayDone ? "true" : "false");
  toggleButton.textContent = todayDone ? "오늘 체크 취소" : "오늘 완료";
  toggleButton.addEventListener("click", () => toggleHabitToday(habit.id));

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "ghost-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => deleteHabit(habit.id));

  actions.append(toggleButton, deleteButton);
  bottom.append(status, actions);
  item.appendChild(bottom);

  return item;
}

function renderHabits() {
  habitList.innerHTML = "";

  if (!habits.length) {
    emptyState.classList.remove("is-hidden");
    return;
  }

  emptyState.classList.add("is-hidden");

  [...habits]
    .sort((left, right) => {
      const todayKey = getDateKey(new Date());
      const leftDone = isHabitDoneOn(left, todayKey);
      const rightDone = isHabitDoneOn(right, todayKey);

      if (leftDone !== rightDone) {
        return Number(leftDone) - Number(rightDone);
      }

      return right.id - left.id;
    })
    .forEach((habit) => {
    habitList.appendChild(createHabitCard(habit));
    });
}

function renderTodayLabel() {
  todayLabel.textContent = formatDate(new Date());
}

function render() {
  renderTodayLabel();
  renderSummary();
  renderWeekOverview();
  renderHabits();
}

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  addHabit({
    emoji: habitEmojiInput.value,
    name: habitNameInput.value,
    note: habitNoteInput.value,
    color: habitColorInput.value
  });
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    habitEmojiInput.value = button.dataset.emoji || "";
    habitNameInput.value = button.dataset.name || "";
    habitNoteInput.value = button.dataset.note || "";
    habitColorInput.value = button.dataset.color || "sunset";
    habitNameInput.focus();
    habitNameInput.setSelectionRange(habitNameInput.value.length, habitNameInput.value.length);
  });
});

render();
