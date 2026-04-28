const ASSETS = {
  potSprout: "./assets/illustrations/pot-sprout.svg",
  leafOrnament: "./assets/illustrations/leaf-ornament.svg",
};

const homeData = {
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
    stats: [
      { icon: "💧", label: "오늘", value: "0" },
      { icon: "🔥", label: "연속", value: "1일" },
      { icon: "🍃", label: "주간", value: "50%" },
    ],
  },
  habits: [
    {
      icon: "🎸",
      title: "우쿨렐레 연습하기",
      text: "작게 시작해도 충분해요.",
      badges: ["1일 연속", "이번 주 1회"],
      action: "기록하기",
    },
    {
      icon: "📖",
      title: "책 10분 읽기",
      text: "짧아도 꾸준히, 한 페이지씩.",
      badges: ["3일 연속", "이번 주 4회"],
      action: "기록하기",
    },
    {
      icon: "🧘",
      title: "가벼운 스트레칭",
      text: "몸을 천천히 깨우는 시간.",
      badges: ["오늘 시작", "이번 주 2회"],
      action: "기록하기",
    },
  ],
};

const headerHeroRoot = document.querySelector("#headerHero");
const gardenStatusRoot = document.querySelector("#gardenStatus");
const habitSectionHeaderRoot = document.querySelector("#habitSectionHeader");
const habitListRoot = document.querySelector("#habitList");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
      <div class="stat-icon" aria-hidden="true">${escapeHtml(stat.icon)}</div>
      <p class="stat-label">${escapeHtml(stat.label)}</p>
      <p class="stat-value">${escapeHtml(stat.value)}</p>
    </article>
  `;
}

function GardenStatusCard(data) {
  return `
    <article class="status-card">
      <div class="date-chip">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3.5" y="5.5" width="17" height="15" rx="3" stroke="currentColor" stroke-width="1.8"/>
          <path d="M3.5 9.5H20.5" stroke="currentColor" stroke-width="1.8"/>
          <path d="M8 3.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M16 3.5V7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <span>${escapeHtml(data.date)}</span>
      </div>

      <div class="status-main">
        <div class="status-copy">
          <p class="status-kicker">${escapeHtml(data.kicker)}</p>
          <h2 class="status-title">${escapeHtml(data.title)}</h2>
          <p class="status-text">${escapeHtml(data.text)}</p>
        </div>

        <div class="status-ring" aria-hidden="true">
          <img class="status-illustration" src="${ASSETS.potSprout}" alt="">
        </div>
      </div>

      <div class="stat-grid">
        ${data.stats.map(StatCard).join("")}
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
  return `
    <article class="habit-card">
      <div class="habit-card-top">
        <div class="habit-icon-tile" aria-hidden="true">${escapeHtml(habit.icon)}</div>
        <div class="habit-body">
          <div class="habit-header-row">
            <h3 class="habit-title">${escapeHtml(habit.title)}</h3>
            <div class="habit-menu" aria-hidden="true">⋯</div>
          </div>
          <p class="habit-text">${escapeHtml(habit.text)}</p>
          <div class="badge-row">
            ${habit.badges.map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")}
          </div>
          <div class="habit-actions">
            <button type="button" class="record-button">
              <span>${escapeHtml(habit.action)}</span>
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

function renderHome() {
  headerHeroRoot.innerHTML = HeaderHero(homeData.hero);
  gardenStatusRoot.innerHTML = GardenStatusCard(homeData.status);
  habitSectionHeaderRoot.innerHTML = SectionHeader({
    eyebrow: "Garden Cards",
    title: "오늘 돌볼 습관",
    text: "필요한 카드부터 시작해보세요.",
  });
  habitListRoot.innerHTML = homeData.habits.map(HabitCard).join("");
}

renderHome();
