import React, { useState, useEffect } from 'react';
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
  ChevronUpIcon,
  ArrowTopRight
} from '../common/icons';
import { usePreventScroll } from '../../hooks/usePreventScroll';
import { articleService, Article } from '@/services/articleService';
import { formatRelativeDate } from '@/utils/dateUtils';

interface ArticlePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTagClick?: (tag: { id: number; name: string }) => void;
  article: {
    id: string;
    title: string;
    image?: string;
    thumbnail?: string;
    tldr: string;
    tags?: Array<{
      id: number;
      name: string;
      slug: string;
    }>;
    category?: {
      id: number;
      name: string;
      slug: string;
    };
    description?: string;
    readTime?: number;
    postDate: string;
    tableOfContents?: Array<{
      id: string;
      title: string;
      level: number;
    }>;
    url: string;
  };
}

const defaultHashtags = ['selfimprovement', 'productivity', 'learning', 'growth'];

const ArticlePopup: React.FC<ArticlePopupProps> = ({ isOpen, onClose, onTagClick, article: initialArticle }) => {
  usePreventScroll(isOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [currentArticle, setCurrentArticle] = useState(initialArticle);

  // Update currentArticle when initialArticle changes
  useEffect(() => {
    setCurrentArticle(initialArticle);
  }, [initialArticle]);

  // Fetch related articles based on category and tags
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!currentArticle.id) return;
      
      try {
        setIsLoadingRelated(true);
        
        const filters: any = {
          id: {
            $ne: currentArticle.id
          }
        };

        const orConditions = [];

        if (currentArticle.category?.id) {
          orConditions.push({
            category: {
              id: {
                $eq: currentArticle.category.id
              }
            }
          });
        }

        const validTagIds = currentArticle.tags?.map(tag => tag.id) || [];

        if (validTagIds.length > 0) {
          orConditions.push({
            tags: {
              id: {
                $in: validTagIds
              }
            }
          });
        }

        if (orConditions.length > 0) {
          filters.$or = orConditions;
        }

        const response = await articleService.getArticles({
          filters,
          pagination: {
            page: 1,
            pageSize: 3
          },
          sort: 'publishedAt:desc',
          populate: ['category', 'tags']
        });

        setRelatedArticles(response.data);
      } catch (error) {
        console.error('Error fetching related articles:', error);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    if (isOpen) {
      fetchRelatedArticles();
    }
  }, [isOpen, currentArticle.id, currentArticle.category, currentArticle.tags]);

  // Handle clicking on a related article
  const handleRelatedArticleClick = async (articleId: string) => {
    try {
      const response = await articleService.getArticle(articleId);
      if (response.data) {
        // Map the article data to match the expected format
        const mappedArticle = {
          id: response.data.id.toString(),
          title: response.data.title,
          description: response.data.description,
          image: response.data.thumbnail,
          thumbnail: response.data.thumbnail,
          tldr: response.data.tldr,
          tags: response.data.tags,
          category: response.data.category,
          readTime: response.data.readTime,
          postDate: response.data.postDate,
          tableOfContents: response.data.tableOfContents,
          url: response.data.url
        };
        setCurrentArticle(mappedArticle);
      }
    } catch (error) {
      console.error('Error fetching article details:', error);
    }
  };

  // Use provided hashtags or fallback to defaults
  const hashtags = currentArticle.tags || defaultHashtags;

  const summaryText = currentArticle.description || '';

  const truncatedText = summaryText.slice(0, 250) + '...';

  const handleTagClick = (tag: { id: number; name: string }) => {
    if (onTagClick) {
      onTagClick(tag);
      onClose();
    }
  };

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
                src={currentArticle.image || currentArticle.thumbnail} 
                alt={currentArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4 dark:text-white">
                {currentArticle.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                {currentArticle.readTime && <span>⏱️ {currentArticle.readTime} min read</span>}
                {currentArticle.postDate && (
                  <span>📅 {formatRelativeDate(currentArticle.postDate)}</span>
                )}
              </div>

              {/* TLDR Section with enhanced styling */}
              <div className="mb-8 bg-purple-50 dark:bg-purple-900/10 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-purple-600 dark:text-purple-400 font-semibold text-lg">About this article</h2>
                  <div className="h-px flex-1 bg-purple-200 dark:bg-purple-800"></div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {currentArticle.tldr || currentArticle.description}
                </p>

                
                
                {/* Hashtags section */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <HashtagIcon className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  {hashtags.slice(0, 5).map((tag) => (
                    <button 
                      key={tag.id}
                      onClick={() => handleTagClick(tag)}
                      className="text-purple-600 dark:text-purple-400 text-sm hover:text-purple-700 dark:hover:text-purple-300 cursor-pointer"
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {currentArticle.tags && currentArticle.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-6">
                  <TagIcon className="w-5 h-5 text-gray-400" />
                  {currentArticle.tags.slice(0, 3).map((tag) => (
                    <span 
                      key={tag.id}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Voting and Read Article buttons */}
              <div className="flex items-center gap-4 justify-between">
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

                <a 
                  href={currentArticle.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowTopRight className="w-4 h-4" />
                </a>
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
              {currentArticle.tableOfContents && currentArticle.tableOfContents.length > 0 ? (
                <nav className="space-y-2 text-gray-600 dark:text-gray-300">
                  {currentArticle.tableOfContents
                    .filter(section => section.level <= 2) // Only show level 1 and 2
                    .map((section) => (
                      <div
                        key={section.id}
                        className={`block hover:text-purple-600 ${
                          section.level === 2 ? '' : ''  // Indent only level 2
                        }`}
                      >
                        {`${section.title}`}
                      </div>
                    ))}
                </nav>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No table of contents available
                </p>
              )}
            </div>

            {/* You might also like */}
            <div>
              <h3 className="text-lg font-semibold mb-4 dark:text-white">You might also like</h3>
              <div className="space-y-4">
                {isLoadingRelated ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Loading related articles...</p>
                ) : relatedArticles.length > 0 ? (
                  relatedArticles.map((relatedArticle) => (
                    <div 
                      key={relatedArticle.id} 
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
                      onClick={() => handleRelatedArticleClick(relatedArticle.documentId)}
                    >
                      <SparklesIcon className="w-5 h-5 text-purple-500 dark:text-purple-400 flex-shrink-0 mt-1" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {relatedArticle.title}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No related articles found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePopup; 