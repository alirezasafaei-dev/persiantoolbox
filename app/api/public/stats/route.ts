import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { getAnalyticsSummary } = await import('@/lib/analyticsStore');
    const summary = await getAnalyticsSummary();

    const totalEvents = summary.totalEvents ?? 0;

    const toolEvents = Object.entries(summary.eventCounts ?? {})
      .filter(([key]) => key.startsWith('tool_'))
      .reduce((sum, [, count]) => sum + count, 0);

    const pdfViews = Object.entries(summary.pathCounts ?? {})
      .filter(([path]) => path.startsWith('/pdf-tools') || path.startsWith('/tools/pdf'))
      .reduce((sum, [, count]) => sum + count, 0);

    const financeViews = Object.entries(summary.pathCounts ?? {})
      .filter(
        ([path]) =>
          path.startsWith('/salary') || path.startsWith('/loan') || path.startsWith('/interest'),
      )
      .reduce((sum, [, count]) => sum + count, 0);

    return NextResponse.json({
      totalViews: totalEvents,
      totalCalculations: toolEvents,
      pdfFilesProcessed: pdfViews,
      financeCalculations: financeViews,
    });
  } catch {
    return NextResponse.json({
      totalViews: 0,
      totalCalculations: 0,
      pdfFilesProcessed: 0,
      financeCalculations: 0,
    });
  }
}
