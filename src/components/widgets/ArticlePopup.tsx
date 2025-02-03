import React, { useState } from 'react';
import { 
  XIcon, 
  ThumbUpIcon, 
  ThumbDownIcon, 
  ShareIcon,
  TagIcon,
  SparklesIcon,
  WhatsAppIcon,
  FacebookIcon,
  TwitterIcon,
  LinkedInIcon,
  HashtagIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '../common/icons';
import { usePreventScroll } from '../../hooks/usePreventScroll';
import mockArticles from '@/pages/Articles/mockArticles';

interface ArticlePopupProps {
  isOpen: boolean;
  onClose: () => void;
  article: {
    title: string;
    image?: string;
    thumbnail?: string;
    tldr: string;
    tags?: string[];
    hashtags?: string[];
    description?: string;
    readTime?: number;
    publishedAt?: string;
  };
}

const defaultHashtags = ['selfimprovement', 'productivity', 'learning', 'growth'];

const ArticlePopup: React.FC<ArticlePopupProps> = ({ isOpen, onClose, article }) => {
  usePreventScroll(isOpen);
  const [isExpanded, setIsExpanded] = useState(false);

  // Get 3 random articles excluding the current one
  
  const relatedArticles = React.useMemo(() => {
    const otherArticles =  mockArticles.filter(a => a.id !== article.id); //instead of the mock data call the articles api
    return otherArticles
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
  }, [article.id]);

  // Use provided hashtags or fallback to defaults
  const hashtags = article.tags || defaultHashtags;

  const summaryText = article.description || '';

  const truncatedText = summaryText.slice(0, 250) + '...';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-6xl h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden font-jakarta-plus">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex h-full">
          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl">
              {/* Image */}
              <img 
                src={article.image || article.thumbnail} 
                alt={article.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4 dark:text-white">
                {article.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                {article.readTime && <span>⏱️ {article.readTime} min read</span>}
                {article.publishedAt && (
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                )}
              </div>

              {/* TLDR Section with enhanced styling */}
              <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-purple-600 dark:text-purple-400 font-semibold text-lg">TLDR</h2>
                  <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {article.tldr}
                </p>

                {/* Summary section */}
                <div className="mt-6">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {isExpanded ? summaryText : truncatedText}
                  </p>
                  
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-2 flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        Show less
                        <ChevronUpIcon className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show more
                        <ChevronDownIcon className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
                
                {/* Hashtags section */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <HashtagIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  {hashtags.map((hashtag) => (
                    <span 
                      key={hashtag}
                      className="text-purple-600 dark:text-purple-400 text-sm hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                    >
                      #{hashtag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                  {article.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Voting */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-500">
                  <ThumbUpIcon className="w-6 h-6" />
                  <span>Upvote</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500">
                  <ThumbDownIcon className="w-6 h-6" />
                  <span>Downvote</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6 overflow-y-auto">
            {/* Share section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Share</h3>
              <div className="grid grid-cols-4 gap-4">
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <WhatsAppIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <FacebookIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <TwitterIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
                <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                  <LinkedInIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>

            {/* Table of contents */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Table of contents</h3>
              <nav className="space-y-2 text-gray-600 dark:text-gray-300">
                <a href="#" className="block hover:text-purple-600">1. Introduction</a>
                <a href="#" className="block hover:text-purple-600">2. Getting Started</a>
                <a href="#" className="block hover:text-purple-600">3. Features</a>
                <a href="#" className="block hover:text-purple-600">4. Conclusion</a>
              </nav>
            </div>

            {/* You might also like */}
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">You might also like</h3>
              <div className="space-y-4">
                {relatedArticles.map((relatedArticle) => (
                  <div key={relatedArticle.id} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg">
                    <SparklesIcon className="w-5 h-5 text-purple-500 flex-shrink-0 mt-1" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {relatedArticle.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePopup; 