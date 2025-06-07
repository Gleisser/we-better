import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';

import StoriesBar from '@/shared/components/layout/StoriesBar/StoriesBar';
import DashboardGrid from '@/shared/components/layout/DashboardGrid/DashboardGrid';
import AIAssistantButton from '@/shared/components/common/AIAssistantButton/AIAssistantButton';
import { LoadingOverlay } from '@/shared/components/common';
import { useAuth } from '@/shared/hooks/useAuth';

import { articleService, ArticleResponse, Article } from '@/core/services/articleService';
import * as affirmationsService from '@/core/services/affirmationsService';
import { PersonalAffirmation } from '@/core/services/affirmationsService';
import * as lifeWheelApi from '@/features/life-wheel/api/lifeWheelApi';
import { LifeWheelData } from '@/features/life-wheel/types';
import * as quoteService from '@/core/services/quoteService'; 
import { QuoteResponse, Quote } from '@/core/services/quoteService'; 
import * as habitsService from '@/core/services/habitsService'; // Added
import { HabitsResponse } from '@/core/services/habitsService'; // Added
// Removed imports for goals services and their types as per subtask focus
// import * as goalsService from '@/core/services/goalsService';
// import { GoalsResponse } from '@/core/services/goalsService';


// Removed imports for hook-specific query keys not used in this focused refactoring
// import { PERSONAL_AFFIRMATION_KEY } from '@/shared/hooks/useAffirmations';
import { HABITS_QUERY_KEY } from '@/shared/hooks/useHabits'; // Added
// import { GOALS_QUERY_KEY } from '@/shared/hooks/useGoals';
import { queryClient } from '@/core/config/react-query';

import styles from './Dashboard.module.css';

const Dashboard = (): JSX.Element => {
  const { isAuthenticated } = useAuth();
  const defaultStaleTime = queryClient.getDefaultOptions().queries?.staleTime ?? (1000 * 60 * 5);

  const queryConfigs = [
    {
      queryKey: ['featuredArticleDashboard'],
      queryFn: () => articleService.getArticles({ sort: 'publishedAt:desc', pagination: { page: 1, pageSize: 1 } }),
      enabled: isAuthenticated,
      staleTime: defaultStaleTime,
    },
    {
      queryKey: ['personalAffirmationDashboard'], // Using a distinct key as per instruction
      queryFn: () => affirmationsService.fetchPersonalAffirmation(),
      enabled: isAuthenticated,
      staleTime: defaultStaleTime,
    },
    {
      queryKey: ['lifeWheelLatestDashboard'],
      queryFn: () => lifeWheelApi.getLatestLifeWheelData(),
      enabled: isAuthenticated,
      staleTime: defaultStaleTime,
    },
    {
      queryKey: ['initialQuotesDashboard'],
      queryFn: () => quoteService.getQuotes({ pagination: { page: 1, pageSize: 5 }, populate: ['categories'] }),
      enabled: isAuthenticated,
      staleTime: defaultStaleTime,
    },
    {
      queryKey: [HABITS_QUERY_KEY, undefined, false], // Key for useHabits (category, showArchived)
      queryFn: () => habitsService.getHabits(undefined, true, false), // service params (category, active, archived)
      enabled: isAuthenticated,
      staleTime: defaultStaleTime,
    },
    // Removed query for Goals as per subtask focus
  ];

  const results = useQueries({ queries: queryConfigs });

  const featuredArticleResult = results[0] as UseQueryResult<ArticleResponse, Error>;
  const personalAffirmationResult = results[1] as UseQueryResult<PersonalAffirmation | null, Error>;
  const lifeWheelLatestResult = results[2] as UseQueryResult<LifeWheelData, Error>;
  const initialQuotesResult = results[3] as UseQueryResult<QuoteResponse, Error>; 
  const initialHabitsResult = results[4] as UseQueryResult<HabitsResponse | null, Error>; // Added habits result
  // Result for Goals is removed

  const isLoadingDashboard = results.some(result => result.isLoading && result.fetchStatus !== 'idle' && result.status !== 'success');
  const overallError = results.find(result => result.isError)?.error;

  if (overallError) {
    console.error("Error fetching dashboard data:", overallError);
  }
  
  const featuredArticle: Article | undefined = featuredArticleResult.data?.data?.[0];
  const initialQuotes: Quote[] | undefined = initialQuotesResult.data?.data?.map(q => ({
    ...q, 
    categories: q.categories || [] 
  }));


  return (
    <>
      <Helmet>
        <title>Dashboard - Lumina</title>
        <meta name="description" content="Your personal dashboard to track habits, goals, and more." />
      </Helmet>
      {isLoadingDashboard && <LoadingOverlay message="Loading your dashboard..." />}
      <div className={styles.container}>
        <DashboardGrid 
          featuredArticle={featuredArticle} 
          isLoading={isLoadingDashboard} // Use the new combined loading state
          initialPersonalAffirmation={personalAffirmationResult.data}
          initialLifeWheelData={lifeWheelLatestResult.data}
          initialQuotes={initialQuotes} 
          initialHabits={initialHabitsResult.data} // Added initialHabits prop
          // Removed initialGoals prop
        />
        <StoriesBar />
        <AIAssistantButton />
      </div>
    </>
  );
};

export default Dashboard;
