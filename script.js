const STORAGE_KEY = "habitGardenStateV2";

const PALETTES = {
  sunset: "tone-sunset",
  mint: "tone-mint",
  citrus: "tone-citrus",
  berry: "tone-berry",
};

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const SHORT_DAYS = ["월", "화", "수", "목", "금", "토", "일"];

const habitForm = document.querySelector("#habitForm");
const habitEmojiInput = document.querySelector("#habitEmoji");
const habitNameInput = document.querySelector("#habitName");
const habitNoteInput = document.querySelector("#habitNote");
const habitColorInput = document.querySelector("#habitColor");
const habitList = document.querySelector("#habitList");
const emptyState = document.querySelector("#emptyState");
const todayLabel = document.querySelector("#todayLabel");
const activeCount = document.querySelector("#activeCount");
const doneTodayCount = document.querySelector("#doneTodayCount");
const strongestStreak = document.querySelector("#strongestStreak");
const weeklyRate = document.querySelector("#weeklyRate");
const insightTitle = document.querySelector("#insightTitle");
const insightText = document.querySelector("#insightText");
const weekOverview = document.querySelector("#weekOverview");
const presetButtons = Array.from(document.querySelectorAll(".preset-chip"));

let habits = loadHabits();

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeHabit);
  } catch (error) {
    console.error("Failed to load habits", error);
    return [];
  }
}

function normalizeHabit(habit) {
  const normalizedHistory = normalizeDateList(Array.isArray(habit.history) ? habit.history : []);
  return {
    id: typeof habit.id === "string" ? habit.id : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    emoji: typeof habit.emoji === "string" && habit.emoji.trim() ? habit.emoji.trim() : "🌿",
    name: typeof habit.name === "string" ? habit.name.trim() : "",
    note: typeof habit.note === "string" ? habit.note.trim() : "",
    color: PALETTES[habit.color] ? habit.color : "mint",
    createdAt: typeof habit.createdAt === "string" ? habit.createdAt : new Date().toISOString(),
    history: normalizedHistory,
  };
}

function saveHabits() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function normalizeDateList(list) {
  return [...new Set(list.filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item)))].sort();
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatToday(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = KOREAN_DAYS[date.getDay()];
  return `${year}년 ${month}월 ${day}일 ${weekday}요일`;
}

function formatShortDate(dateKey) {
  const date = parseDateKey(dateKey);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = KOREAN_DAYS[date.getDay()];
  return `${month}월 ${day}일 (${weekday})`;
}

function getStartOfWeek(date = new Date()) {
  const current = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  current.setDate(current.getDate() + diff);
  return current;
}

function getWeekDates(date = new Date()) {
  const start = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next;
  });
}

function isHabitDoneOn(habit, dateKey) {
  return habit.history.includes(dateKey);
}

function getCurrentStreak(habit) {
  if (!habit.history.length) return 0;

  let streak = 0;
  let pointer = new Date();
  while (true) {
    const pointerKey = getDateKey(pointer);
    if (!isHabitDoneOn(habit, pointerKey)) {
      if (streak === 0) {
        pointer.setDate(pointer.getDate() - 1);
        const previousKey = getDateKey(pointer);
        if (!isHabitDoneOn(habit, previousKey)) break;
        streak += 1;
      } else {
        break;
      }
    } else {
      streak += 1;
    }
    pointer.setDate(pointer.getDate() - 1);
  }

  return streak;
}

function getWeeklyCount(habit, weekDates = getWeekDates()) {
  return weekDates.reduce((count, date) => count + Number(isHabitDoneOn(habit, getDateKey(date))), 0);
}

function getLastDoneText(habit) {
  if (!habit.history.length) return "아직 체크 전";
  const lastDateKey = habit.history[habit.history.length - 1];
  if (lastDateKey === getDateKey()) return "오늘 체크 완료";
  return `${formatShortDate(lastDateKey)} 마지막 체크`;
}

function addHabit({ emoji, name, note, color }) {
  const nextHabit = normalizeHabit({
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    emoji,
    name,
    note,
    color,
    createdAt: new Date().toISOString(),
    history: [],
  });

  if (!nextHabit.name) return;

  habits = [nextHabit, ...habits];
  saveHabits();
}

function toggleHabitToday(id) {
  const todayKey = getDateKey();
  habits = habits.map((habit) => {
    if (habit.id !== id) return habit;
    const hasToday = isHabitDoneOn(habit, todayKey);
    const nextHistory = hasToday
      ? habit.history.filter((entry) => entry !== todayKey)
      : [...habit.history, todayKey];
    return {
      ...habit,
      history: normalizeDateList(nextHistory),
    };
  });
  saveHabits();
}

function deleteHabit(id) {
  habits = habits.filter((habit) => habit.id !== id);
  saveHabits();
}

function getSummary(list, weekDates = getWeekDates()) {
  const totalHabits = list.length;
  const todayKey = getDateKey();
  const doneToday = list.filter((habit) => isHabitDoneOn(habit, todayKey)).length;
  const longestStreak = list.reduce((max, habit) => Math.max(max, getCurrentStreak(habit)), 0);
  const weeklyChecks = list.reduce((count, habit) => count + getWeeklyCount(habit, weekDates), 0);
  const weeklyTarget = totalHabits * weekDates.filter((date) => getDateKey(date) <= todayKey).length;
  const weeklyPercent = weeklyTarget > 0 ? Math.round((weeklyChecks / weeklyTarget) * 100) : 0;

  return {
    totalHabits,
    doneToday,
    longestStreak,
    weeklyPercent,
  };
}

function getInsight(summary) {
  if (summary.totalHabits === 0) {
    return {
      title: "씨앗을 심어볼 시간이에요",
      text: "오늘 반복하고 싶은 행동 하나부터 시작해보세요.",
    };
  }

  if (summary.doneToday === summary.totalHabits) {
    return {
      title: "오늘 정원을 모두 돌봤어요",
      text: "지금 리듬을 이어가면 작은 반복이 금방 눈에 보이기 시작해요.",
    };
  }

  if (summary.doneToday === 0) {
    return {
      title: "오늘의 첫 체크를 기다리고 있어요",
      text: "가장 쉬운 습관 하나만 먼저 완료해도 흐름이 금방 살아나요.",
    };
  }

  return {
    title: "좋은 리듬이 만들어지고 있어요",
    text: `오늘 ${summary.doneToday}개를 체크했어요. 남은 습관도 가볍게 이어가보세요.`,
  };
}

function renderSummary(summary) {
  activeCount.textContent = `${summary.totalHabits}`;
  doneTodayCount.textContent = `${summary.doneToday}`;
  strongestStreak.textContent = `${summary.longestStreak}일`;
  weeklyRate.textContent = `${summary.weeklyPercent}%`;

  const insight = getInsight(summary);
  insightTitle.textContent = insight.title;
  insightText.textContent = insight.text;
}

function renderWeekOverview(list, weekDates = getWeekDates()) {
  weekOverview.innerHTML = "";

  weekDates.forEach((date, index) => {
    const dateKey = getDateKey(date);
    const completed = list.filter((habit) => isHabitDoneOn(habit, dateKey)).length;
    const total = list.length;
    const isFuture = dateKey > getDateKey();
    const ratio = total > 0 ? Math.round((completed / total) * 100) : 0;

    const item = document.createElement("li");
    item.className = "week-pill";

    const ratioLabel = isFuture ? "예정" : total === 0 ? "-" : `${completed}/${total}`;
    const caption = isFuture ? "기록 전" : total === 0 ? "습관 없음" : `${ratio}%`;
    const fillWidth = isFuture || total === 0 ? 0 : ratio;

    item.innerHTML = `
      <span class="week-day">${SHORT_DAYS[index]}</span>
      <span class="week-ratio">${ratioLabel}</span>
      <span class="week-track"><span class="week-fill" style="width:${fillWidth}%"></span></span>
      <span class="week-caption">${caption}</span>
    `;

    weekOverview.appendChild(item);
  });
}

function createMiniWeek(habit, weekDates = getWeekDates()) {
  const container = document.createElement("div");
  container.className = "mini-week";

  weekDates.forEach((date, index) => {
    const dateKey = getDateKey(date);
    const item = document.createElement("div");
    const isFuture = dateKey > getDateKey();
    const isDone = isHabitDoneOn(habit, dateKey);

    item.className = `mini-day${isDone ? " is-done" : ""}${isFuture ? " is-future" : ""}`;
    item.innerHTML = `
      <span class="mini-label">${SHORT_DAYS[index]}</span>
      <span class="mini-dot"></span>
    `;
    container.appendChild(item);
  });

  return container;
}

function createHabitCard(habit, weekDates = getWeekDates()) {
  const item = document.createElement("li");
  item.className = `habit-item ${PALETTES[habit.color] || PALETTES.mint}`;

  const streak = getCurrentStreak(habit);
  const weeklyCount = getWeeklyCount(habit, weekDates);
  const todayDone = isHabitDoneOn(habit, getDateKey());
  const note = habit.note ? habit.note : "아직 메모가 없어요. 왜 이 습관을 이어가고 싶은지 적어보세요.";
  const statusText = todayDone ? "오늘 체크가 반영됐어요." : "오늘 아직 체크 전이에요.";

  const top = document.createElement("div");
  top.className = "habit-top";
  top.innerHTML = `
    <div class="habit-title">
      <div class="habit-icon">${habit.emoji}</div>
      <div class="habit-name-wrap">
        <h3>${escapeHtml(habit.name)}</h3>
        <p class="habit-note">${escapeHtml(note)}</p>
      </div>
    </div>
    <span class="streak-badge">${streak}일 연속</span>
  `;

  const meta = document.createElement("div");
  meta.className = "habit-meta";
  meta.innerHTML = `
    <span>이번 주 ${weeklyCount}회 체크</span>
    <span>${escapeHtml(getLastDoneText(habit))}</span>
  `;

  const week = createMiniWeek(habit, weekDates);

  const status = document.createElement("div");
  status.className = "habit-status";
  status.innerHTML = `
    <span>${escapeHtml(statusText)}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "habit-actions";

  const toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.className = todayDone ? "secondary-button" : "primary-button";
  toggleButton.textContent = todayDone ? "체크 취소" : "오늘 완료";
  toggleButton.addEventListener("click", () => {
    toggleHabitToday(habit.id);
    render();
  });

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "ghost-button";
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => {
    deleteHabit(habit.id);
    render();
  });

  actions.append(toggleButton, deleteButton);
  item.append(top, meta, week, status, actions);
  return item;
}

function renderHabits(list, weekDates = getWeekDates()) {
  habitList.innerHTML = "";

  if (!list.length) {
    emptyState.classList.remove("is-hidden");
    return;
  }

  emptyState.classList.add("is-hidden");

  const todayKey = getDateKey();
  const sorted = [...list].sort((left, right) => {
    const leftDone = isHabitDoneOn(left, todayKey);
    const rightDone = isHabitDoneOn(right, todayKey);
    if (leftDone !== rightDone) return Number(leftDone) - Number(rightDone);
    return right.createdAt.localeCompare(left.createdAt);
  });

  sorted.forEach((habit) => {
    habitList.appendChild(createHabitCard(habit, weekDates));
  });
}

function renderTodayLabel() {
  todayLabel.textContent = formatToday();
}

function render() {
  habits = habits.map(normalizeHabit);
  const weekDates = getWeekDates();
  const summary = getSummary(habits, weekDates);
  renderTodayLabel();
  renderSummary(summary);
  renderHabits(habits, weekDates);
  renderWeekOverview(habits, weekDates);
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

habitForm.addEventListener("submit", (event) => {
  event.preventDefault();

  addHabit({
    emoji: habitEmojiInput.value.trim() || "🌿",
    name: habitNameInput.value.trim(),
    note: habitNoteInput.value.trim(),
    color: habitColorInput.value,
  });

  habitForm.reset();
  habitEmojiInput.value = "🌿";
  habitColorInput.value = "mint";
  render();
  habitNameInput.focus();
});

presetButtons.forEach((button) => {
  button.addEventListener("click", () => {
    habitEmojiInput.value = button.dataset.emoji || "🌿";
    habitNameInput.value = button.dataset.name || "";
    habitNoteInput.value = button.dataset.note || "";
    habitColorInput.value = button.dataset.color || "mint";
    habitNameInput.focus();
    habitNameInput.setSelectionRange(habitNameInput.value.length, habitNameInput.value.length);
  });
});

habitEmojiInput.value = habitEmojiInput.value || "🌿";
habitColorInput.value = habitColorInput.value || "mint";
render();
