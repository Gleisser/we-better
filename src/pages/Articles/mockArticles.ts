export interface Article {
  id: string;
  title: string;
  description: string;
  tldr: string;
  image: string;
  thumbnail: string;
  tags: string[];
  hashtags: string[];
  readTime: number;
  publishedAt: string;
  category: string;
  url: string;
}

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'I Feel Like a Hacker Using These Cool Linux Terminal Tools',
    description: 'Explore a list of entertaining Linux terminal tools that can make you feel like a hacker.',
    tldr: `Discover a curated collection of Linux terminal tools that transform your command line experience into something straight out of a cyberpunk movie. From the matrix-like cascading characters of Cmatrix to the Hollywood-style hacking simulations, these tools not only make your terminal look cool but also serve practical purposes.

Key highlights:
• Genact: Simulates realistic-looking activity for when you want to look busy
• Cmatrix: Creates the famous Matrix digital rain effect
• Hollywood: Generates a busy terminal that looks like movie hacking scenes
• TEXTREME: Adds unnecessary but cool animations to your text
• No More Secrets: Recreates the data decryption effect from "Sneakers"

Whether you're giving a presentation, creating a demo, or just want to add some flair to your terminal, these tools provide both entertainment and functionality.`,
    image: '/images/articles/linux-tools.jpg',
    thumbnail: '/images/articles/linux-tools-thumb.jpg',
    tags: ['linux', 'tools', 'security', 'terminal'],
    hashtags: ['linux', 'programming', 'technology', 'hacking', 'opensource', 'coding', 'developer', 'terminal'],
    readTime: 5,
    publishedAt: '2024-01-15',
    category: 'technology',
    url: 'https://itsfoss.com/cool-linux-terminal-tools/'
  },
  // Add more mock articles as needed
];

export default mockArticles; 