import { ToolTab } from "@/types/tool";


export const TOOLS_FALLBACK: ToolTab[] = [
  {
    id: "image-generation",
    title: "Image Generation",
    subtitle: "Envision The Extraordinary",
    description: "Take creativity a step further with the transformative power of our Image Generation tool. It’s not just about bringing your concepts to life — redefine the impossible. From beginners to professionals, we offer a spectrum of settings that can be intuitively tailored to your needs. Discover an unprecedented fusion of simplicity and power, designed to cater to creative minds at all levels.",
    videoSrc: {
      id: "image-generation",
      name: "Image Generation",
      video: [{
        url: "/assets/videos/Image-Generation.webm"
      }]
    }
  },
  {
    id: "ai-canvas",
    title: "AI Canvas",
    subtitle: "Create Without Limits",
    description: "Our AI Canvas blends robust editing functions with the immersive creative process, providing you complete control. Erase distractions, adjust dimensions and finesse every detail of your designs — all under one roof.With Canvas, you’re not just using a tool; you are the true alchemist of your creation.",
    videoSrc: {
      id: "ai-canvas",
      name: "AI Canvas",
      video: [{
        url: "/assets/videos/AI-Canvas.webm"
      }]
    }
  },
  {
    id: "3d-texture-generation",
    title: "3D Texture Generation",
    subtitle: "Transform Your 3D World",
    description: "Breathe life into 3D assets like never before. Just upload your OBJ file, generate textures with contextual intelligence and download the enriched files tailor-made for diverse applications. Supercharge the design process with our avant-garde tool, and take your projects to new heights.",
    videoSrc: {
      id: "3d-texture-generation",
      name: "3D Texture Generation",
      video: [{
        url: "/assets/videos/3D-Texture-Generation.webm"
      }]
    }
  }
]; 

export default TOOLS_FALLBACK;