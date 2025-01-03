import { ToolTab } from "@/types/tool";


export const TOOLS_FALLBACK: ToolTab[] = [
  {
    id: "progress-tracking",
    title: "Progress Tracking",
    subtitle: "Keep an eye on how you are progressing towards your goals",
    description: "Tailored resources at your fingertips—handpicked to align with your goals, challenges, and aspirations.",
    videoSrc: {
      id: "progress-tracking",
      name: "Progress Tracking",
      video: [{
        url: "/assets/videos/Image-Generation.webm"
      }]
    }
  },
  {
    id: "curated-articles",
    title: "Curated Articles",
    subtitle: "Stay ahead of the curve with our curated articles",
    description: "Based on your needs and interests we display a series of relevant articles that will help you to achieve your goals.",
    videoSrc: {
      id: "curated-articles",
      name: "Curated Articles",
      video: [{
        url: "/assets/videos/AI-Canvas.webm"
      }]
    }
  },
  {
    id: "networking",
    title: "Networking",
    subtitle: "Connect with people with the same mindset as you",
    description: "Be part of a vibrant community, and share progress and motivation in the group. Grow together!",
    videoSrc: {
      id: "networking",
      name: "Networking",
      video: [{
        url: "/assets/videos/3D-Texture-Generation.webm"
      }]
    }
  }
]; 

export default TOOLS_FALLBACK;