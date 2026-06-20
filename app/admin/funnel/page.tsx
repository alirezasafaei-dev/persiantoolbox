import SiteShell from '@/components/ui/SiteShell';
import { buildMetadata } from '@/lib/seo';
import { funnelStages, getEventsByStage } from '@/lib/funnel-events';

export const metadata = buildMetadata({
  title: 'قیف تبدیل - مستندات',
  description: 'مستندات رویدادهای قیف تبدیل بین‌سایتی.',
  path: '/admin/funnel',
  robots: { index: false, follow: false },
});

export default function FunnelDashboardPage() {
  return (
    <SiteShell containerClassName="py-10">
      <div className="space-y-10">
        <section className="section-surface p-6 md:p-8">
          <h1 className="text-3xl font-black text-[var(--text-primary)]">قیف تبدیل</h1>
          <p className="text-[var(--text-secondary)] mt-2">
            مستندات رویدادهای قیف تبدیل بین‌سایتی. این رویدادها برای ردیابی مسیر کاربر از بازدید
            اولیه تا تبدیل نهایی استفاده می‌شوند.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">مراحل قیف</h2>
          <div className="grid gap-4 md:grid-cols-5">
            {funnelStages.map((stage, i) => (
              <div
                key={stage.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-4 text-center"
              >
                <div className="text-xs text-[var(--text-muted)]">مرحله {i + 1}</div>
                <div className="text-lg font-bold mt-1" style={{ color: stage.color }}>
                  {stage.label}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {getEventsByStage(stage.id).length} رویداد
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-[var(--text-primary)]">رویدادها بر اساس مرحله</h2>
          {funnelStages.map((stage) => {
            const events = getEventsByStage(stage.id);
            return (
              <div
                key={stage.id}
                className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3"
              >
                <h3 className="text-lg font-bold" style={{ color: stage.color }}>
                  {stage.label}
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {events.map((event) => (
                    <div
                      key={event.event + event.site}
                      className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4 space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-[var(--surface-1)] px-2 py-0.5 rounded">
                          {event.event}
                        </code>
                        <span className="text-xs text-[var(--text-muted)]">{event.site}</span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">{event.description}</p>
                      <ul className="text-xs text-[var(--text-muted)] space-y-1">
                        {event.triggers.map((t) => (
                          <li key={t}>• {t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        <section className="rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--surface-1)] p-6 space-y-3">
          <h2 className="text-lg font-black text-[var(--text-primary)]">مشارکت‌کنندگان</h2>
          <div className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <div className="font-bold text-[var(--text-primary)]">PersianToolbox</div>
              <div className="text-[var(--text-muted)]">ابزارهای رایگان فارسی</div>
              <div className="text-xs text-[var(--color-primary)] mt-1">
                awareness + interest + consideration
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <div className="font-bold text-[var(--text-primary)]">Portfolio</div>
              <div className="text-[var(--text-muted)]">اعتماد و صلاحیت</div>
              <div className="text-xs text-[var(--color-primary)] mt-1">
                consideration + conversion
              </div>
            </div>
            <div className="rounded-[var(--radius-md)] bg-[var(--surface-2)] p-4">
              <div className="font-bold text-[var(--text-primary)]">Audit Systems</div>
              <div className="text-[var(--text-muted)]">ارزیابی و پرداخت</div>
              <div className="text-xs text-[var(--color-primary)] mt-1">intent + conversion</div>
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
