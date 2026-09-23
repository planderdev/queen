import '../../vendor/flatpickr/flatpickr.min.js';
import '../../vendor/flatpickr/ko.js';

const pickers = new Set();
const glyph = name => `<i data-lucide="${name}" aria-hidden="true"></i>`;

export function hydrateFormControls() {
  for (const picker of pickers) {
    if (!picker.input.isConnected) { picker.destroy(); pickers.delete(picker); }
  }
  document.querySelectorAll('select:not([multiple])').forEach(select => {
    if (select.closest('.select-control') || select.size > 1) return;
    const wrapper = document.createElement('span');
    wrapper.className = 'select-control';
    select.before(wrapper); wrapper.append(select);
    wrapper.insertAdjacentHTML('beforeend', glyph('chevron-down'));
  });
  document.querySelectorAll('input[type="date"],input[type="datetime-local"]').forEach(input => {
    if (input._flatpickr) return;
    const unavailable = input.disabled || input.readOnly;
    const withTime = input.type === 'datetime-local';
    input.dataset.calendarType = input.type;
    const wrapper = document.createElement('span');
    wrapper.className = 'date-control';
    input.before(wrapper); wrapper.append(input);
    const toggle = document.createElement('button');
    toggle.disabled = unavailable;
    toggle.type = 'button'; toggle.className = 'date-toggle';
    toggle.setAttribute('aria-label', '달력 열기');
    toggle.innerHTML = glyph('calendar-days');
    wrapper.append(toggle);
    input.placeholder = withTime ? '날짜·시간 선택' : '날짜 선택';
    input.setAttribute('aria-haspopup', 'dialog');
    input.setAttribute('aria-expanded', 'false');
    const validate = () => {
      const value = input.value;
      const format = withTime ? /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/ : /^\d{4}-\d{2}-\d{2}$/;
      const parsed = value && format.test(value) && globalThis.flatpickr.parseDate(value, withTime ? 'Y-m-d\\TH:i' : 'Y-m-d');
      const valid = !value || format.test(value) && parsed && globalThis.flatpickr.formatDate(parsed, withTime ? 'Y-m-d\\TH:i' : 'Y-m-d') === value;
      const inRange = !value || (!input.min || value >= input.min) && (!input.max || value <= input.max);
      input.setCustomValidity(valid && inRange ? '' : '허용된 범위의 올바른 날짜를 입력해주세요.');
    };
    const place = instance => {
      const box = input.getBoundingClientRect(), calendar = instance.calendarContainer;
      const {width,height} = calendar.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--space-16'));
      calendar.style.left = `${Math.max(inset, Math.min(box.left, innerWidth - width - inset))}px`;
      calendar.style.top = `${Math.max(inset, box.bottom + height + inset <= innerHeight ? box.bottom : box.top - height)}px`;
    };
    const picker = globalThis.flatpickr(input, {
      locale: 'ko', disableMobile: true, allowInput: true, static: true, clickOpens: !unavailable,
      enableTime: withTime, time_24hr: true, minuteIncrement: 1,
      dateFormat: withTime ? 'Y-m-d\\TH:i' : 'Y-m-d',
      ariaDateFormat: 'Y년 n월 j일', monthSelectorType: 'static',
      minDate: input.min || undefined, maxDate: input.max || undefined,
      prevArrow: glyph('chevron-left'), nextArrow: glyph('chevron-right'),
      onReady: (_, __, instance) => {
        instance.calendarContainer.classList.add('datepicker-theme');
        instance.calendarContainer.setAttribute('role', 'dialog');
        instance.calendarContainer.setAttribute('aria-label', withTime ? '날짜와 시간 선택' : '날짜 선택');
        instance.prevMonthNav.setAttribute('aria-label', '이전 달');
        instance.nextMonthNav.setAttribute('aria-label', '다음 달');
        [[instance.prevMonthNav,-1],[instance.nextMonthNav,1]].forEach(([control,direction]) => {
          control.tabIndex = 0; control.setAttribute('role', 'button');
          control.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); instance.changeMonth(direction); }
          });
        });
      },
      onOpen: (_, __, instance) => { input.setAttribute('aria-expanded', 'true'); place(instance); },
      onClose: () => { input.setAttribute('aria-expanded', 'false'); validate(); },
      onChange: validate
    });
    toggle.addEventListener('click', event => { event.preventDefault(); picker.isOpen ? picker.close() : picker.open(); });
    input.addEventListener('input', validate);
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape' && picker.isOpen) { event.preventDefault(); event.stopPropagation(); picker.close(); toggle.focus(); }
    });
    pickers.add(picker);
  });
}

// Re-renders are cleaned up on hydrate; form resets synchronize the calendar state.
document.addEventListener('reset', event => setTimeout(() => {
  event.target.querySelectorAll('[data-calendar-type]').forEach(input => {
    input._flatpickr?.setDate(input.defaultValue, false);
    input.setCustomValidity('');
  });
}, 0));
window.addEventListener('resize', () => pickers.forEach(picker => picker.close()));

document.addEventListener('scroll', event => pickers.forEach(picker => {
  if (picker.isOpen && !picker.calendarContainer.contains(event.target)) picker.close();
}), true);
