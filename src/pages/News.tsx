
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import NewsAndRSSFeeds from '@/components/news/NewsAndRSSFeeds';

const News = () => {
  return (
    <DashboardLayout>
      <NewsAndRSSFeeds />
    </DashboardLayout>
  );
};

export default News;
