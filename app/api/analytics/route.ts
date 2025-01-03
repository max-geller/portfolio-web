import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { format } from 'date-fns';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeFrame = searchParams.get('timeFrame') || '30';
  
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GOOGLE_ANALYTICS_PROPERTY_ID}`,
      dateRanges: [{
        startDate: `${timeFrame}daysAgo`,
        endDate: 'today',
      }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
      ],
    });

    const data = response.rows?.map(row => ({
      date: format(new Date(row.dimensionValues![0].value!), 'MMM dd'),
      visitors: parseInt(row.metricValues![0].value!),
      pageViews: parseInt(row.metricValues![1].value!),
    })) || [];

    return NextResponse.json(data);
  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}