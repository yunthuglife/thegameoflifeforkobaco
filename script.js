// 실제 서비스 시 문항/해설은 국민권익위원회 자료 등으로 검증해 주세요.
const questions = [
  {
    npc: "거래처 직원",
    situation: "거래처 직원이 명절을 맞아 5만 원 상당의 선물세트를 보내왔습니다.",
    question: "가장 적절한 대응은?",
    choices: ["감사히 받는다", "직무 관련성과 금액 기준을 확인한 뒤 절차대로 처리한다", "돌려보내지 않고 조용히 챙긴다", "동료에게 나눠준다"],
    answer: 1,
    explanation: "청탁금지법상 직무 관련자로부터의 금품은 금액과 직무 관련성에 따라 수수 가능 여부가 달라지므로, 규정에 따라 처리해야 합니다."
  },
  {
    npc: "본인이 심사위원인 사업 신청자",
    situation: "본인이 심사위원으로 참여하는 사업에 배우자가 대표로 있는 업체가 신청했습니다.",
    question: "가장 적절한 대응은?",
    choices: ["가족이니 더 꼼꼼히 심사한다", "즉시 회피(제척) 신청을 하고 심사에서 빠진다", "동료에게만 알리고 그대로 진행한다", "낮은 점수를 줘서 공정성을 증명한다"],
    answer: 1,
    explanation: "이해충돌방지법상 배우자가 이해관계자인 직무는 스스로 수행에서 배제(회피)해야 합니다."
  },
  {
    npc: "친한 선배 공무원",
    situation: "친한 선배가 인허가 처리를 빨리 해달라고 개인적으로 부탁합니다.",
    question: "가장 적절한 대응은?",
    choices: ["선배 부탁이니 순서를 앞당겨 처리한다", "정해진 절차와 순서대로 처리하고 사적 청탁은 수용하지 않는다", "거절이 어려우니 상급자 핑계를 댄다", "일단 알겠다고 하고 나중에 미룬다"],
    answer: 1,
    explanation: "공적 업무는 청탁 여부와 관계없이 정해진 절차에 따라 처리해야 합니다."
  }
  // 같은 구조로 10문항까지 추가
];

const state = { playerType: null, playerName: "", currentIndex: 0, score: 0 };
let typingSkip = false;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(el => el.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---- 타이핑 연출 ----
function typeText(el, text, speed = 25) {
  return new Promise(resolve => {
    el.textContent = "";
    el.classList.add("typing");
    typingSkip = false;
    let i = 0;
    function step() {
      if (typingSkip) {
        el.textContent = text;
        el.classList.remove("typing");
        resolve();
        return;
      }
      el.textContent += text[i];
      i++;
      if (i < text.length) setTimeout(step, speed);
      else { el.classList.remove("typing"); resolve(); }
    }
    step();
  });
}

document.querySelector(".dialogue-area").addEventListener("click", () => { typingSkip = true; });

function triggerEnter(el) {
  el.classList.remove("enter");
  void el.offsetWidth; // 애니메이션 재시작용 강제 리플로우
  el.classList.add("enter");
}

// ---- 인트로/선택/이름 ----
document.getElementById("btn-start").addEventListener("click", () => showScreen("screen-select"));
document.querySelectorAll(".char-option").forEach(btn => {
  btn.addEventListener("click", () => { state.playerType = btn.dataset.type; showScreen("screen-name"); });
});
document.getElementById("btn-confirm-name").addEventListener("click", () => {
  state.playerName = document.getElementById("input-name").value.trim() || "플레이어";
  startQuiz();
});

// ---- 퀴즈 ----
function startQuiz() {
  state.currentIndex = 0;
  state.score = 0;
  showScreen("screen-quiz");
  triggerEnter(document.getElementById("player-sprite"));
  renderQuestion();
}

async function renderQuestion() {
  const q = questions[state.currentIndex];
  document.getElementById("quiz-progress").textContent = `${state.currentIndex + 1} / ${questions.length}`;
  document.getElementById("player-sprite").textContent = `[${state.playerName} 뒷모습]`;
  document.getElementById("npc-sprite").textContent = `[${q.npc}]`;
  triggerEnter(document.getElementById("npc-sprite"));

  const choicesEl = document.getElementById("choices");
  choicesEl.innerHTML = "";
  choicesEl.classList.add("fade-hidden");
  document.getElementById("feedback").classList.add("hidden");

  await typeText(document.getElementById("situation-text"), q.situation);
  await typeText(document.getElementById("question-text"), q.question);

  q.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.textContent = choice;
    btn.addEventListener("click", () => selectAnswer(idx));
    choicesEl.appendChild(btn);
  });
  choicesEl.classList.remove("fade-hidden");
}

async function selectAnswer(idx) {
  const q = questions[state.currentIndex];
  if (idx === q.answer) state.score++;

  document.querySelectorAll("#choices button").forEach((b, i) => {
    b.disabled = true;
    if (i === q.answer) b.classList.add("correct");
    else if (i === idx) b.classList.add("wrong");
  });

  const feedbackEl = document.getElementById("feedback");
  const nextBtn = document.getElementById("btn-next");
  feedbackEl.classList.remove("hidden");
  nextBtn.classList.add("hidden");

  await typeText(document.getElementById("feedback-text"), q.explanation);
  nextBtn.classList.remove("hidden");
}

document.getElementById("btn-next").addEventListener("click", () => {
  state.currentIndex++;
  if (state.currentIndex < questions.length) renderQuestion();
  else showEnding();
});

// ---- 엔딩 ----
function getEnding(score) {
  if (score === 10) return { title: "완벽", desc: "청렴한 공직 생활의 모범입니다." };
  if (score >= 7) return { title: "무난한 생활", desc: "대체로 원칙을 잘 지키고 있습니다." };
  if (score >= 5) return { title: "청렴교육 대상", desc: "몇 가지 기준을 다시 점검해볼 필요가 있습니다." };
  return { title: "감사 지적사항", desc: "이대로면 감사에서 문제가 될 수 있습니다." };
}

function showEnding() {
  const result = getEnding(state.score);
  document.getElementById("ending-title").textContent = result.title;
  document.getElementById("ending-desc").textContent = result.desc;
  document.getElementById("ending-score").textContent = `${state.playerName}님의 점수: ${state.score} / ${questions.length}`;
  showScreen("screen-ending");
}

document.getElementById("btn-restart").addEventListener("click", () => showScreen("screen-intro"));
