import { TestimonyItem } from "@/types/testimony";

export const TESTIMONY_FALLBACK = {
    id: 1,
    title: "A community of over [highlight]4 million[/highlight] is waiting for you",
    description: "Leonardo's power extends beyond our revolutionary tools — we are anchored in one of the largest and most supportive AI communities worldwide, and we're deeply committed to it.",
    testimonies: [
        {
            id: 1,
            testimony: "Leonardo gave me a way of expressing myself in a completely new and different way. Without AI I was only a consumer. Now I can create.",
            username: "Malakai030",
            profilePic: {
                url: "/assets/images/testimonies/profile_1.webp"
            }
        },
        {
            id: 2,
            testimony: "Leo is suitable for those who are just starting their way in the world of AI images, as well as for professionals, who are offered a wide range of tools to work with.",
            username: "Raini Studios",
            profilePic: {
        url: "/assets/images/testimonies/profile_2.webp"
            }
        },
        {
            id: 3,
            testimony: "With its powerful fined tuned models Leonardo makes A.I art a breeze. The community is also the best I've found to date!",
            username: "Dee Does A.I",
            profilePic: {
                url: "/assets/images/testimonies/profile_3.webp"
            }
        }
    ] as TestimonyItem[]
}

export default TESTIMONY_FALLBACK;