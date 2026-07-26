// Newsletter subscription form
(function() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('input[type="email"]')?.value?.trim();
    const name = form.querySelector('input[name="name"]')?.value?.trim();
    const msgEl = form.querySelector('.newsletter-message');

    if (!email) {
      if (msgEl) msgEl.textContent = '이메일 주소를 입력해주세요.';
      return;
    }

    const btn = form.querySelector('button');
    btn.disabled = true;
    btn.textContent = '구독 중...';

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, source: 'fatec-homepage' })
      });
      if (res.ok) {
        if (msgEl) {
          msgEl.textContent = '✅ 구독이 완료되었습니다! 확인 메일을 보내드렸습니다.';
          msgEl.style.color = '#059669';
        }
        form.querySelector('input[type="email"]').value = '';
        if (form.querySelector('input[name="name"]')) form.querySelector('input[name="name"]').value = '';
      } else {
        throw new Error('Server error');
      }
    } catch (err) {
      if (msgEl) {
        msgEl.textContent = '❌ 구독 처리 중 오류가 발생했습니다. 다시 시도해주세요.';
        msgEl.style.color = '#dc2626';
      }
    } finally {
      btn.disabled = false;
      btn.textContent = '구독하기';
    }
  });
})();