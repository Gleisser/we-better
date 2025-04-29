import { TestimonyItem } from "@/types/testimony";

export const TESTIMONY_FALLBACK = {
    id: 1,
    title: "Connect with [highlight]like-minded individuals[/highlight] and share your progress.",
    subtitle: "We Better goes beyond personalized tools—our platform is built on a thriving community of like-minded individuals, all driven to achieve their goals and support each other on the journey to self-improvement.",
    testimonies: [
        {
            id: 1,
            testimony: "We Better has been my go-to platform for self-improvement. It’s not just about achieving goals—it’s about understanding my weaknesses and turning them into strengths. I can’t imagine my growth journey without it.",
            username: "Ayesha K., 27, Student",
            profilePic: {
                url: "/assets/images/testimonies/testimony_1.webp"
            }
        },
        {
            id: 2,
            testimony: "What makes We Better special isn’t just the personalized tools—it’s the supportive community. Knowing others are on similar journeys makes the process so much more rewarding. I love sharing my wins and learning from others!",
            username: "Chris T., 31, Software Developer",
            profilePic: {
                url: "/assets/images/testimonies/testimony_2.webp"
            }
        },
        {
            id: 3,
            testimony: "We Better has completely transformed the way I approach my goals. I used to feel overwhelmed and scattered, but now I have a clear path and personalized resources to guide me. The progress tracker keeps me motivated every day!",
            username: "Emily S., 29, Marketing Professional",
            profilePic: {
                url: "/assets/images/testimonies/testimony_3.webp"
            }
        }
    ] as TestimonyItem[]
}

export default TESTIMONY_FALLBACK;