let content = []; // use 'let' instead of 'const'

const calendar = document.getElementById('calendar');
const modal = document.getElementById('modal');
const dayTitle = document.getElementById('day-title');
const dayContent = document.getElementById('day-content');
const completeBtn = document.getElementById('complete-btn');
const closeBtn = document.getElementById('close-btn');

let currentDay = null;

fetch('content.json')
  .then(response => response.json())
  .then(data => {
    content = data;
    buildCalendar(); // only build calendar after content is loaded
  })
  .catch(error => {
    console.error('Failed to load content:', error);
  });

function buildCalendar() {
  for (let i = 1; i <= 30; i++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'day';
    dayEl.textContent = `Day ${i}`;
    dayEl.dataset.day = i;

    if (localStorage.getItem(`day${i}`) === 'complete') {
      dayEl.classList.add('complete');
    }

    dayEl.addEventListener('click', () => openModal(i));
    calendar.appendChild(dayEl);
  }
}

function openModal(day) {
  currentDay = day;
  const dayData = content[day - 1];
  if (dayData) {
    dayTitle.textContent = dayData.title;
    dayContent.textContent = dayData.body;
    modal.classList.remove('hidden');
  } else {
    dayTitle.textContent = 'Content not found';
    dayContent.textContent = 'Please check content.json.';
    modal.classList.remove('hidden');
  }
}

function closeModal() {
  modal.classList.add('hidden');
}

completeBtn.addEventListener('click', () => {
    if (currentDay) {
      const dayKey = `day${currentDay}`;
      const dayEl = document.querySelector(`.day[data-day="${currentDay}"]`);
      const isComplete = localStorage.getItem(dayKey) === 'complete';
  
      if (isComplete) {
        localStorage.removeItem(dayKey);
        dayEl.classList.remove('complete');
        completeBtn.textContent = 'Mark as Complete ✅';
      } else {
        localStorage.setItem(dayKey, 'complete');
        dayEl.classList.add('complete');
        completeBtn.textContent = 'Unmark as Complete ❌';
      }
  
      closeModal();
    }
  });  

closeBtn.addEventListener('click', closeModal);
