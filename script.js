const STORAGE_KEY = "habitGardenV2State";

const ASSETS = {
  potSprout: "./assets/illustrations/pot-sprout.svg",
  leafOrnament: "./assets/illustrations/leaf-ornament.svg",
};

const DEFAULT_STATE = {
  hero: {
    eyebrow: "Habit Garden",
    title: "작은 습관 정원",
    text: "오늘도 가볍게 가꿔요.",
  },
  status: {
    date: "2026년 4월 28일 화요일",
    kicker: "오늘의 정원",
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

const EMOJI_OPTIONS = ["🌿", "💧", "📖", "🧘", "🌙", "🎸", "🏃", "🍎", "☀️", "🪴"];
const COLOR_OPTIONS = [
  { value: "mint", label: "민트빛" },
  { value: "sunset", label: "노을빛" },
  { value: "citrus", label: "햇살빛" },
  { value: "berry", label: "베리빛" },
];

const roots = {
  heroMount: document.querySelector("#heroMount"),
  statusMount: document.querySelector("#statusMount"),
  habitHeaderMount: document.querySelector("#habitHeaderMount"),
  habitListMount: document.querySelector("#habitListMount"),
  composerMount: document.querySelector("#composerMount"),
};

let state = loadState();

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaultState();
    }

    const parsed = JSON.parse(raw);
    return {
      hero: parsed.hero ?? cloneDefaultState().hero,
      status: parsed.status ?? cloneDefaultState().status,
      habits: Array.isArray(parsed.habits) && parsed.habits.length
        ? parsed.habits.map(normalizeHabit)
        : cloneDefaultState().habits,
    };
  } catch (error) {
    console.error("Failed to load Habit Garden v2 state", error);
    return cloneDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeHabit(habit) {
  return {
    id: typeof habit.id === "string" ? habit.id : `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    icon: typeof habit.icon === "string" && habit.icon.trim() ? habit.icon.trim() : "🌿",
    title: typeof habit.title === "string" && habit.title.trim() ? habit.title.trim() : "새 습관",
    text: typeof habit.text === "string" && habit.text.trim() ? habit.text.trim() : "작게 시작해도 충분해요.",
    streak: Number.isFinite(habit.streak) ? Math.max(0, habit.streak) : 0,
    weeklyCount: Number.isFinite(habit.weeklyCount) ? Math.max(0, habit.weeklyCount) : 0,
    recordedToday: Boolean(habit.recordedToday),
  };
}

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
  const weeklyGoal = Math.max(1, state.habits.length * 7);
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
            <details class="habit-menu-shell">
              <summary class="habit-menu" aria-label="${escapeHtml(habit.title)} 메뉴">···</summary>
              <div class="habit-menu-popover">
                <button type="button" class="habit-menu-item" data-action="delete" data-id="${escapeHtml(habit.id)}">삭제</button>
              </div>
            </details>
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

function EmptyHabitCard() {
  return `
    <article class="habit-card habit-card-empty">
      <div class="empty-copy">
        <p class="empty-kicker">첫 습관</p>
        <h3 class="empty-title">작은 습관 하나를 심어보세요</h3>
        <p class="empty-text">아래 새 습관 심기에서 이름 하나만 적어도 정원이 바로 시작돼요.</p>
      </div>
    </article>
  `;
}

function ComposerSection() {
  return `
    <details class="composer-card" id="composerCard">
      <summary class="composer-summary">
        <div>
          <p class="section-eyebrow">New Habit</p>
          <h2 class="composer-title" id="composerSectionTitle">새 습관 심기</h2>
          <p class="composer-text">작은 습관 하나를 더 심어볼까요?</p>
        </div>
        <span class="composer-toggle" aria-hidden="true"></span>
      </summary>

      <form class="composer-form" id="composerForm">
        <label class="composer-field">
          <span class="composer-label">습관 이름</span>
          <input class="composer-input" id="habitNameInput" name="title" type="text" maxlength="28" placeholder="예: 물 2리터 마시기" required>
        </label>

        <label class="composer-field">
          <span class="composer-label">아이콘</span>
          <div class="emoji-row" id="emojiRow">
            ${EMOJI_OPTIONS.map((emoji, index) => `
              <button type="button" class="emoji-pill${index === 0 ? " is-selected" : ""}" data-action="pick-emoji" data-emoji="${emoji}">${emoji}</button>
            `).join("")}
          </div>
        </label>

        <details class="composer-detail" id="composerDetail">
          <summary class="composer-detail-toggle">+ 메모와 색 더하기</summary>
          <div class="composer-detail-body">
            <label class="composer-field">
              <span class="composer-label">짧은 설명</span>
              <input class="composer-input" id="habitTextInput" name="text" type="text" maxlength="48" placeholder="작게 시작해도 충분해요.">
            </label>

            <label class="composer-field">
              <span class="composer-label">분위기 색</span>
              <select class="composer-select" id="habitColorInput" name="color">
                ${COLOR_OPTIONS.map((option) => `<option value="${option.value}">${escapeHtml(option.label)}</option>`).join("")}
              </select>
            </label>
          </div>
        </details>

        <input id="habitEmojiInput" name="icon" type="hidden" value="🌿">

        <button type="submit" class="composer-submit">습관 추가</button>
      </form>
    </details>
  `;
}

function toggleHabitRecord(id) {
  state.habits = state.habits.map((habit) => {
    if (habit.id !== id) {
      return habit;
    }

    const nextRecordedToday = !habit.recordedToday;
    return {
      ...habit,
      recordedToday: nextRecordedToday,
      weeklyCount: nextRecordedToday ? habit.weeklyCount + 1 : Math.max(0, habit.weeklyCount - 1),
      streak: nextRecordedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1),
    };
  });

  saveState();
}

function deleteHabit(id) {
  state.habits = state.habits.filter((habit) => habit.id !== id);
  saveState();
}

function addHabit(formData) {
  const title = formData.get("title")?.trim();
  if (!title) {
    return;
  }

  state.habits = [
    ...state.habits,
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      icon: formData.get("icon")?.trim() || "🌿",
      title,
      text: formData.get("text")?.trim() || "작게 시작해도 충분해요.",
      streak: 0,
      weeklyCount: 0,
      recordedToday: false,
    },
  ];

  saveState();
}

function renderHome() {
  roots.heroMount.innerHTML = HeaderHero(state.hero);
  roots.statusMount.innerHTML = GardenStatusCard(state.status);
  roots.habitHeaderMount.innerHTML = SectionHeader({
    eyebrow: "Garden Cards",
    title: "오늘 돌볼 습관",
    text: "필요한 카드부터 시작해보세요.",
  });
  roots.habitListMount.innerHTML = state.habits.length
    ? state.habits.map(HabitCard).join("")
    : EmptyHabitCard();
  roots.composerMount.innerHTML = ComposerSection();
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) {
    document.querySelectorAll(".habit-menu-shell[open]").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
    return;
  }

  const action = target.dataset.action;

  if (action === "record") {
    toggleHabitRecord(target.dataset.id);
    renderHome();
    return;
  }

  if (action === "delete") {
    const habit = state.habits.find((item) => item.id === target.dataset.id);
    const confirmed = window.confirm(`"${habit?.title ?? "이 습관"}"을 삭제할까요?`);
    if (!confirmed) {
      return;
    }
    deleteHabit(target.dataset.id);
    renderHome();
    return;
  }

  if (action === "pick-emoji") {
    const input = document.querySelector("#habitEmojiInput");
    const row = document.querySelector("#emojiRow");
    if (!input || !row) {
      return;
    }
    input.value = target.dataset.emoji;
    row.querySelectorAll(".emoji-pill").forEach((pill) => {
      pill.classList.toggle("is-selected", pill === target);
    });
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "composerForm") {
    return;
  }

  event.preventDefault();
  addHabit(new FormData(event.target));
  renderHome();

  const composerCard = document.querySelector("#composerCard");
  if (composerCard) {
    composerCard.removeAttribute("open");
  }
});

renderHome();
