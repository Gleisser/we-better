export interface ArticleSource {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  source: ArticleSource;
  readTime: number;
  publishedAt: string;
  tags: string[];
} 