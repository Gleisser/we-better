import React from 'react';
import styles from '../../DreamBoardPage.module.css';
import { Dream } from '../../types';

interface Insight {
  id: string;
  title: string;
  description: string;
  relatedCategories?: string[];
}

interface Resource {
  id: string;
  title: string;
  type: string;
  relevantDreamIds: string[];
}

interface DreamInsightsProps {
  dreams: Dream[];
  insights: Insight[];
  resources: Resource[];
}

const DreamInsights: React.FC<DreamInsightsProps> = ({ dreams, insights, resources }) => {
  return (
    <div className={styles.insightsTab}>
      {/* AI-Powered Insights */}
      <section className={styles.aiInsights}>
        <h2>Dream Insights</h2>
        {insights.map(insight => (
          <div key={insight.id} className={styles.insightCard}>
            <h3>{insight.title}</h3>
            <p>{insight.description}</p>
            {insight.relatedCategories && insight.relatedCategories.length > 0 && (
              <div className={styles.relatedCategories}>
                Related to: {insight.relatedCategories.join(', ')}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Resource Connection */}
      <section className={styles.resourceSection}>
        <h2>Recommended Resources</h2>
        <div className={styles.resourceCards}>
          {resources.map(resource => (
            <div key={resource.id} className={styles.resourceCard}>
              <h3>{resource.title}</h3>
              <p>
                Relevant to:{' '}
                {resource.relevantDreamIds
                  .map(id => dreams.find(d => d.id === id)?.title)
                  .join(', ')}
              </p>
              <div className={styles.resourceType}>{resource.type}</div>
              <button className={styles.resourceButton}>View {resource.type}</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DreamInsights;
