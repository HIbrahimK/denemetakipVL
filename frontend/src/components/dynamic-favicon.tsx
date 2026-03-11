"use client";

import { useEffect } from "react";
import { useSchool } from "@/contexts/school-context";

export default function DynamicFavicon() {
    const { schoolName, schoolLogo } = useSchool();

    useEffect(() => {
        let currentFaviconUrl: string | null = null;
        let currentAppleUrl: string | null = null;
        let cancelled = false;

        const upsertLink = (rel: string, href: string, type = "image/png") => {
            let link = document.querySelector(`link[rel='${rel}']`) as HTMLLinkElement | null;
            if (!link) {
                link = document.createElement("link");
                link.rel = rel;
                document.head.appendChild(link);
            }
            link.type = type;
            link.href = href;
        };

        const updateFavicon = async () => {
            const pageTitle = `${schoolName} - Deneme Takip`;

            // Update page title
            document.title = pageTitle;

            // Create favicon from logo
            try {
                // Load the image
                const img = new Image();
                img.crossOrigin = "anonymous";
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = schoolLogo;
                });

                // Create canvas for favicon (32x32 for better quality)
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                canvas.width = 32;
                canvas.height = 32;

                // Draw image scaled to canvas
                ctx.drawImage(img, 0, 0, 32, 32);

                // Convert canvas to blob
                canvas.toBlob((blob) => {
                    if (!blob || cancelled) return;

                    const faviconUrl = URL.createObjectURL(blob);
                    currentFaviconUrl = faviconUrl;

                    upsertLink("icon", faviconUrl);
                    upsertLink("shortcut icon", faviconUrl);

                    // Create larger icon for apple-touch-icon
                    const appleCanvas = document.createElement('canvas');
                    const appleCtx = appleCanvas.getContext('2d');
                    if (!appleCtx) return;

                    appleCanvas.width = 180;
                    appleCanvas.height = 180;
                    appleCtx.drawImage(img, 0, 0, 180, 180);

                    appleCanvas.toBlob((appleBlob) => {
                        if (!appleBlob || cancelled) return;
                        const appleFaviconUrl = URL.createObjectURL(appleBlob);
                        currentAppleUrl = appleFaviconUrl;
                        upsertLink("apple-touch-icon", appleFaviconUrl);
                    }, 'image/png');
                }, 'image/png');
            } catch (error) {
                console.error('Failed to create favicon:', error);
                // Fallback to direct logo usage
                upsertLink("icon", schoolLogo);
                upsertLink("shortcut icon", schoolLogo);
            }
        };

        updateFavicon();

        return () => {
            cancelled = true;
            if (currentFaviconUrl) {
                URL.revokeObjectURL(currentFaviconUrl);
            }
            if (currentAppleUrl) {
                URL.revokeObjectURL(currentAppleUrl);
            }
        };
    }, [schoolName, schoolLogo]);

    return null;
}
