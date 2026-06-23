document.addEventListener('DOMContentLoaded', () => {
  const widget = document.createElement('div');
  widget.id = 'pt-extension-widget';
  widget.innerHTML = `
    <div class="pt-widget-content">
      <div class="pt-widget-header">
        <span class="pt-widget-logo">🧰</span>
        <span class="pt-widget-title">جعبه ابزار فارسی</span>
      </div>
      <div class="pt-widget-body">
        <p>افزونه کروم نصب شد!</p>
        <p>از آیکون افزونه در نوار ابزار برای دسترسی سریع به ابزارها استفاده کنید.</p>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  setTimeout(() => {
    widget.classList.add('pt-widget-visible');
  }, 1000);

  setTimeout(() => {
    widget.classList.remove('pt-widget-visible');
    setTimeout(() => widget.remove(), 300);
  }, 5000);
});
