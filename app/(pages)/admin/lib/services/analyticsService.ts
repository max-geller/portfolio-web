import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { TrafficData, TimeFrame } from '../../lib/types/analytics';
import { subDays, format } from 'date-fns';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_ANALYTICS_PRIVATE_KEY,
  },
});

export async function getTrafficData(timeFrame: TimeFrame): Promise<TrafficData[]> {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  const daysAgo = timeFrameToDays(timeFrame);

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{
      startDate: `${daysAgo}daysAgo`,
      endDate: 'today',
    }],
    dimensions: [{ name: 'date' }],
    metrics: [
      { name: 'activeUsers' },
      { name: 'screenPageViews' },
    ],
  });

  return response.rows?.map(row => ({
    date: format(new Date(row.dimensionValues![0].value!), 'MMM dd'),
    visitors: parseInt(row.metricValues![0].value!),
    pageViews: parseInt(row.metricValues![1].value!),
  })) || [];
}

function timeFrameToDays(timeFrame: TimeFrame): number {
  switch (timeFrame) {
    case '30': return 30;
    case '60': return 60;
    case '90': return 90;
    case 'quarter': return 90;
    case 'month': return 30;
    case 'year': return 365;
    default: return 30;
  }
}