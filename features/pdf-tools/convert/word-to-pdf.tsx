export default function WordToPdfGuide() {
  return (
    <article className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-(--text-primary)">راهنمای تبدیل Word به PDF</h1>
        <p className="leading-7 text-(--text-secondary)">
          فایل Word را در برنامهٔ نصب‌شده روی دستگاهتان باز کنید و همان‌جا خروجی PDF بگیرید. این
          صفحه راهنمای خروجی گرفتن است و فایل شما را دریافت نمی‌کند.
        </p>
      </header>

      <section className="space-y-2 rounded-lg border border-(--border-medium) p-5">
        <h2 className="text-xl font-semibold text-(--text-primary)">Microsoft Word</h2>
        <ol className="list-decimal space-y-2 ps-6 leading-7 text-(--text-secondary)">
          <li>سند را در نسخهٔ دسکتاپ Word باز کنید.</li>
          <li>
            در منوی <bdi lang="en">File</bdi> گزینهٔ <bdi lang="en">Save As</bdi> یا{' '}
            <bdi lang="en">Save a Copy</bdi> را انتخاب کنید.
          </li>
          <li>نوع فایل را PDF بگذارید و آن را در پوشه‌ای روی دستگاه ذخیره کنید.</li>
        </ol>
      </section>

      <section className="space-y-2 rounded-lg border border-(--border-medium) p-5">
        <h2 className="text-xl font-semibold text-(--text-primary)">LibreOffice Writer</h2>
        <ol className="list-decimal space-y-2 ps-6 leading-7 text-(--text-secondary)">
          <li>سند را در Writer باز کنید.</li>
          <li>
            در منوی <bdi lang="en">File</bdi>، گزینهٔ <bdi lang="en">Export As</bdi> و سپس{' '}
            <bdi lang="en">Export as PDF</bdi> را انتخاب کنید.
          </li>
          <li>صفحه‌ها و محل ذخیره را مشخص کنید و خروجی بگیرید.</li>
        </ol>
      </section>

      <p className="leading-7 text-(--text-secondary)">
        پیش از ارسال PDF، صفحه‌بندی، جدول‌ها و نمایش متن فارسی را در خروجی بررسی کنید. فونت‌های
        نصب‌شده و برنامه‌ای که سند را باز می‌کند می‌توانند ظاهر خروجی را تغییر دهند.
      </p>
    </article>
  );
}
