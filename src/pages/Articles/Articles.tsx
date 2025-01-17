import React, { useState, useEffect } from 'react';
import ArticleCard from '@/components/widgets/ArticleCard';
import styles from './Articles.module.css';
import mockArticles from './mockArticles'; // Import mock data

const Articles = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(mockArticles); // Initialize with mock data

  useEffect(() => {
    // Filter articles based on search term
    const results = mockArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchTerm]);

  return (
    <div className="p-8">
      <h1 className="text-2xl text-white font-plus-jakarta mb-4">Articles</h1>
      
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 mb-6">
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 rounded-md w-full"
        />
      </div>

      {loading ? (
        <p className="text-white/70">Loading articles...</p>
      ) : (
        <div className={styles.articleGrid}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p className="text-white/70">No articles found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Articles; 