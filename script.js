// v2 script.js - with persistent quiz answers and evaluation logic

let content = [];
const calendar = document.getElementById('calendar');
const modal = document.getElementById('modal');
const dayTitle = document.getElementById('day-title');
const dayContent = document.getElementById('day-content');
const completeBtn = document.getElementById('complete-btn');
const closeBtn = document.getElementById('close-btn');
const quizContainer = document.getElementById('quiz-container');
const submitBtn = document.getElementById('submit-btn');
const resetBtn = document.getElementById('reset-btn');

let currentDay = null;
let currentAnswersShown = false;

fetch('content.json')
  .then(response => response.json())
  .then(data => {
    content = data;
    buildCalendar();
  })
  .catch(error => console.error('Failed to load content:', error));

function buildCalendar() {
  calendar.innerHTML = '';
  for (let i = 1; i <= 30; i++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.dataset.day = i;
    updateDayStatus(dayEl, i);
    dayEl.addEventListener('click', () => openModal(i));
    calendar.appendChild(dayEl);
  }
}

function updateDayStatus(dayEl, i) {
  const taskStatus = localStorage.getItem(`day${i}_task`);
  const evalStatus = localStorage.getItem(`day${i}_eval`);
  let text = `Day ${i}\nTask: ${taskStatus || 'pending'}\nEvaluation: ${evalStatus || 'pending'}`;
  dayEl.textContent = text;

  dayEl.classList.remove('pending', 'in-progress', 'complete');
  if (taskStatus === 'complete' && evalStatus === 'complete') {
    dayEl.classList.add('complete'); // green
  } else if (taskStatus === 'complete') {
    dayEl.classList.add('in-progress'); // orange
  } else {
    dayEl.classList.add('pending'); // default
  }
}

function openModal(day) {
  currentDay = day;
  currentAnswersShown = false;
  const dayData = content[day - 1];
  if (!dayData) return;

  dayTitle.textContent = dayData.title;
  dayContent.textContent = dayData.body;
  modal.classList.remove('hidden');
  completeBtn.textContent = 'Mark as Complete ✅';
  buildQuiz(dayData.quiz);
}

function closeModal() {
  modal.classList.add('hidden');
}

function buildQuiz(questions) {
  quizContainer.innerHTML = '';
  questions.forEach((q, idx) => {
    const qDiv = document.createElement('div');
    qDiv.classList.add('quiz-question');
    qDiv.innerHTML = `<p>${q.question}</p>` +
      q.options.map((opt, i) => `
        <label>
          <input type="radio" name="q${idx}" value="${opt}" /> ${opt}
        </label><br>`).join('');
    quizContainer.appendChild(qDiv);
  });

  // Load previously saved answers
  const savedAnswers = JSON.parse(localStorage.getItem(`day${currentDay}_answers`)) || [];
  savedAnswers.forEach((ans, idx) => {
    if (ans !== null) {
      const radio = quizContainer.querySelector(`input[name="q${idx}"][value="${ans}"]`);
      if (radio) radio.checked = true;
    }
  });
}

submitBtn.addEventListener('click', () => {
  if (!currentDay) return;
  const dayData = content[currentDay - 1];
  const correctAnswers = dayData.quiz.map(q => q.answer);

  // Save selected answers
  const userAnswers = [];
  dayData.quiz.forEach((_, qIndex) => {
    const selected = document.querySelector(`input[name="q${qIndex}"]:checked`);
    userAnswers.push(selected ? selected.value : null);
  });
  localStorage.setItem(`day${currentDay}_answers`, JSON.stringify(userAnswers));

  // Show correct answers
  const allQuestions = quizContainer.querySelectorAll('.quiz-question');
  allQuestions.forEach((qDiv, idx) => {
    const labels = qDiv.querySelectorAll('label');
    labels.forEach(label => {
      if (label.textContent.includes(correctAnswers[idx])) {
        label.style.backgroundColor = '#d4edda'; // green for correct
        label.style.fontWeight = 'bold';
      } else {
        label.style.opacity = '0.6';
      }
    });
  });

  // Mark task as complete, evaluation pending
  localStorage.setItem(`day${currentDay}_task`, 'complete');
  localStorage.setItem(`day${currentDay}_eval`, 'pending');
  currentAnswersShown = true;
  buildCalendar();
});

resetBtn.addEventListener('click', () => {
  const radios = quizContainer.querySelectorAll('input[type=radio]');
  radios.forEach(r => r.checked = false);
});

completeBtn.addEventListener('click', () => {
  if (!currentDay) return;

  const evalKey = `day${currentDay}_eval`;
  const taskKey = `day${currentDay}_task`;
  const evalStatus = localStorage.getItem(evalKey);
  const taskStatus = localStorage.getItem(taskKey);

  if (currentAnswersShown) {
    // Toggle evaluation complete/incomplete
    if (evalStatus === 'complete') {
      // Reset everything if unmarking eval
      localStorage.removeItem(evalKey);
      localStorage.removeItem(taskKey);
    } else {
      localStorage.setItem(evalKey, 'complete');
    }
  } else {
    // Toggle task complete/incomplete
    if (taskStatus === 'complete') {
      // Reset everything if unmarking task
      localStorage.removeItem(taskKey);
      localStorage.removeItem(evalKey);
    } else {
      localStorage.setItem(taskKey, 'complete');
    }
  }

  buildCalendar();
  closeModal();
});

closeBtn.addEventListener('click', closeModal);
