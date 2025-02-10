import { useEffect, useState } from 'react';
import StoriesBar from '@/components/layout/StoriesBar/StoriesBar';
import DashboardGrid from '@/components/layout/DashboardGrid/DashboardGrid';
import AIAssistantButton from '@/components/common/AIAssistantButton/AIAssistantButton';
import { articleService, Article } from '@/services/articleService';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [featuredArticle, setFeaturedArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedArticle = async () => {
      try {
        const response = await articleService.getArticles({
          sort: 'publishedAt:desc',
          pagination: {
            page: 1,
            pageSize: 1
          }
        });

        if (response.data.length > 0) {
          setFeaturedArticle(response.data[0]);
        }
      } catch (error) {
        console.error('Error fetching featured article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedArticle();
  }, []);

  return (
    <div className={styles.container}>
      <DashboardGrid featuredArticle={featuredArticle} isLoading={isLoading} />
      <StoriesBar />
      <AIAssistantButton />
    </div>
  );
};

export default Dashboard; 