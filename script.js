const ASSETS = {
  potSprout: "./assets/illustrations/pot-sprout.svg",
  leafOrnament: "./assets/illustrations/leaf-ornament.svg",
};

const state = {
  hero: {
    eyebrow: "Habit Garden",
    title: "작은 습관 정원",
    text: "오늘도 가볍게 가꿔요.",
  },
  status: {
    date: "2026년 4월 28일 화요일",
    kicker: "오늘의 정원",
    title: "첫 물주기 전",
    text: "가장 쉬운 습관부터 시작해요.",
  },
  habits: [
    {
      id: "ukulele",
      icon: "🎸",
      title: "우쿨렐레 연습하기",
      text: "작게 시작해도 충분해요.",
      streak: 1,
      weeklyCount: 1,
      recordedToday: false,
    },
    {
      id: "reading",
      icon: "📖",
      title: "책 10분 읽기",
      text: "짧아도 꾸준히, 한 페이지씩.",
      streak: 3,
      weeklyCount: 4,
      recordedToday: false,
    },
    {
      id: "stretching",
      icon: "🧘",
      title: "가벼운 스트레칭",
      text: "몸을 천천히 깨우는 시간.",
      streak: 0,
      weeklyCount: 2,
      recordedToday: false,
    },
  ],
};

const roots = {
  headerHero: document.querySelector("#headerHero"),
  gardenStatus: document.querySelector("#gardenStatus"),
  habitSectionHeader: document.querySelector("#habitSectionHeader"),
  habitList: document.querySelector("#habitList"),
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getStatusSummary() {
  const doneToday = state.habits.filter((habit) => habit.recordedToday).length;
  const bestStreak = state.habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  const weeklyChecks = state.habits.reduce((sum, habit) => sum + habit.weeklyCount, 0);
  const weeklyGoal = state.habits.length * 7;
  const weeklyRate = Math.round((weeklyChecks / weeklyGoal) * 100);

  return [
    { icon: "💧", label: "오늘", value: `${doneToday}` },
    { icon: "🔥", label: "연속", value: `${bestStreak}일` },
    { icon: "🍃", label: "주간", value: `${weeklyRate}%` },
  ];
}

function getStatusHeadline() {
  const doneToday = state.habits.filter((habit) => habit.recordedToday).length;

  if (doneToday === 0) {
    return {
      title: "첫 물주기 전",
      text: "가장 쉬운 습관부터 시작해요.",
    };
  }

  if (doneToday === state.habits.length) {
    return {
      title: "오늘 물주기 완료",
      text: "정원을 한 바퀴 잘 돌봤어요.",
    };
  }

  return {
    title: "정원이 깨어나는 중",
    text: "리듬이 조금씩 올라오고 있어요.",
  };
}

function HeaderHero(data) {
  return `
    <article class="hero-card">
      <div class="hero-card-inner">
        <div class="hero-copy">
          <p class="eyebrow">${escapeHtml(data.eyebrow)}</p>
          <h1 class="hero-title">${escapeHtml(data.title)}</h1>
          <p class="hero-text">${escapeHtml(data.text)}</p>
        </div>
        <div class="hero-illustration-wrap" aria-hidden="true">
          <img class="hero-illustration" src="${ASSETS.potSprout}" alt="">
          <img class="floating-leaf hero-leaf" src="${ASSETS.leafOrnament}" alt="">
        </div>
      </div>
    </article>
  `;
}

function StatCard(stat) {
  return `
    <article class="stat-card">
      <span class="stat-icon" aria-hidden="true">${escapeHtml(stat.icon)}</span>
      <div class="stat-copy">
        <span class="stat-label">${escapeHtml(stat.label)}</span>
        <strong class="stat-value">${escapeHtml(stat.value)}</strong>
      </div>
    </article>
  `;
}

function GardenStatusCard(status) {
  const headline = getStatusHeadline();
  const stats = getStatusSummary();

  return `
    <article class="status-card">
      <div class="date-chip">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/>
          <path d="M3.5 9.5H20.5" stroke="currentColor" stroke-width="1.8"/>
          <path d="M8 3.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M16 3.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <span>${escapeHtml(status.date)}</span>
      </div>

      <div class="status-main">
        <div class="status-copy">
          <p class="status-kicker">${escapeHtml(status.kicker)}</p>
          <div class="status-title-row">
            <h2 class="status-title">${escapeHtml(headline.title)}</h2>
            <img class="status-leaf" src="${ASSETS.leafOrnament}" alt="">
          </div>
          <p class="status-text">${escapeHtml(headline.text)}</p>
        </div>

        <div class="status-ring" aria-hidden="true">
          <img class="status-illustration" src="${ASSETS.potSprout}" alt="">
        </div>
      </div>

      <div class="stat-grid">
        ${stats.map(StatCard).join("")}
      </div>
    </article>
  `;
}

function SectionHeader(data) {
  return `
    <header class="section-header">
      <p class="section-eyebrow">${escapeHtml(data.eyebrow)}</p>
      <h2 class="section-title" id="habitSectionTitle">${escapeHtml(data.title)}</h2>
      <p class="section-text">${escapeHtml(data.text)}</p>
      <img class="leaf-accent" src="${ASSETS.leafOrnament}" alt="">
    </header>
  `;
}

function HabitCard(habit) {
  const chips = [
    habit.streak > 0 ? `${habit.streak}일 연속` : "오늘 시작",
    `이번 주 ${habit.weeklyCount}회`,
  ];

  return `
    <article class="habit-card" data-id="${escapeHtml(habit.id)}">
      <div class="habit-top">
        <div class="habit-icon-tile" aria-hidden="true">${escapeHtml(habit.icon)}</div>
        <div class="habit-main">
          <div class="habit-header-row">
            <div class="habit-heading">
              <h3 class="habit-title">${escapeHtml(habit.title)}</h3>
              <p class="habit-text">${escapeHtml(habit.text)}</p>
            </div>
            <button type="button" class="habit-menu" data-action="menu" aria-label="${escapeHtml(habit.title)} 메뉴">⋯</button>
          </div>

          <div class="habit-bottom">
            <div class="badge-row">
              ${chips.map((chip) => `<span class="badge">${escapeHtml(chip)}</span>`).join("")}
            </div>
            <button type="button" class="record-button" data-action="record" data-id="${escapeHtml(habit.id)}">
              <span>${habit.recordedToday ? "기록 취소" : "기록하기"}</span>
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function toggleHabitRecord(id) {
  state.habits = state.habits.map((habit) => {
    if (habit.id !== id) return habit;

    const nextRecorded = !habit.recordedToday;
    const nextWeekly = nextRecorded ? habit.weeklyCount + 1 : Math.max(0, habit.weeklyCount - 1);
    const nextStreak = nextRecorded ? Math.max(1, habit.streak + (habit.streak > 0 ? 0 : 0)) : Math.max(0, habit.streak - 1);

    return {
      ...habit,
      recordedToday: nextRecorded,
      weeklyCount: nextWeekly,
      streak: nextRecorded ? Math.max(1, habit.streak) : nextStreak,
    };
  });
}

function renderHome() {
  roots.headerHero.innerHTML = HeaderHero(state.hero);
  roots.gardenStatus.innerHTML = GardenStatusCard(state.status);
  roots.habitSectionHeader.innerHTML = SectionHeader({
    eyebrow: "Garden Cards",
    title: "오늘 돌볼 습관",
    text: "필요한 카드부터 시작해보세요.",
  });
  roots.habitList.innerHTML = state.habits.map(HabitCard).join("");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  if (action === "record") {
    toggleHabitRecord(target.dataset.id);
    renderHome();
  }

  if (action === "menu") {
    window.alert("세부 메뉴는 다음 단계에서 연결할 수 있어요.");
  }
});

renderHome();
