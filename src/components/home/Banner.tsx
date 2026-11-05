"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, Keyboard, Navigation, Pagination } from "swiper/modules";
import { ArrowRightIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

type BannerSlide = {
    image: string;
    alt: string;
    headline: string;
    subtext: string;
};

/** High-res background images (Unsplash) with per-slide copy */
const SLIDES: BannerSlide[] = [
    {
        image:
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1920&q=80",
        alt: "Professional camera set up in a photography studio",
        headline: "Shoot Your Next Masterpiece",
        subtext:
            "Fully-equipped photography studios with seamless backdrops, strobes, and natural light — booked by the hour.",
    },
    {
        image:
            "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1920&q=80",
        alt: "Mixing console inside a music recording suite",
        headline: "Record Where Legends Do",
        subtext:
            "Acoustically treated recording suites stocked with vintage gear, monitoring, and everything but the talent.",
    },
    {
        image:
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1920&q=80",
        alt: "Film slate clapping on a production stage",
        headline: "Raise the Curtain on Your Film",
        subtext:
            "Production stages with lighting rigs, green rooms, and space to move — from indie shorts to commercial shoots.",
    },
    {
        image:
            "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1920&q=80",
        alt: "Broadcast microphone in a podcast studio",
        headline: "Your Podcast Deserves a Home",
        subtext:
            "Soundproof lounges with broadcast mics, multi-cam setups, and same-day file delivery.",
    },
];

export function Banner() {
    return (
        <Swiper
            modules={[A11y, Autoplay, Keyboard, Navigation, Pagination]}
            // autoplay + loop, dots + arrows, keyboard accessible
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop
            pagination={{ clickable: true }}
            navigation
            keyboard={{ enabled: true }}
            grabCursor
            aria-label="Featured studio highlights"
            className="banner h-105 w-full sm:h-120 lg:h-140"
        >
            {SLIDES.map((slide) => (
                <SwiperSlide key={slide.image} className="relative">
                    {/* background image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={slide.image}
                        alt={slide.alt}
                        className="absolute inset-0 size-full object-cover"
                    />
                    {/* subtle dark gradient overlay for text contrast */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/45 to-black/20" />

                    {/* slide copy + CTA */}
                    <div className="relative flex h-full items-center">
                        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                                {slide.headline}
                            </h2>
                            <p className="mt-4 max-w-xl text-white/80 sm:text-lg">
                                {slide.subtext}
                            </p>
                            <div className="mt-6">
                                {/* Base UI's `render={<Link/>}` + nativeButton={false} keeps
                    anchors consistent with <Button asChild> usage */}
                                <Button size="lg" className="h-11 px-6 text-base" render={<Link href="/studios" />} nativeButton={false}>
                                    Explore Studios
                                    <ArrowRightIcon data-icon="inline-end" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
