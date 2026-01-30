"use client";

import { useEffect } from "react";
import { useSchool } from "@/contexts/school-context";

export default function DynamicFavicon() {
    const { schoolName, schoolLogo } = useSchool();

    useEffect(() => {
        const updateFavicon = async () => {
            const pageTitle = `${schoolName} - Deneme Takip`;

            // Update page title
            document.title = pageTitle;

            // Remove existing favicons safely
            const existingLinks = document.querySelectorAll("link[rel*='icon']");
            existingLinks.forEach(link => {
                try {
                    if (link.parentNode) {
                        link.parentNode.removeChild(link);
                    }
                } catch (e) {
                    // Ignore removal errors
                }
            });

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
                    if (!blob) return;

                    const faviconUrl = URL.createObjectURL(blob);

                    // Add new favicon
                    const link = document.createElement('link');
                    link.rel = 'icon';
                    link.type = 'image/png';
                    link.href = faviconUrl;
                    document.head.appendChild(link);

                    // Add shortcut icon
                    const shortcutLink = document.createElement('link');
                    shortcutLink.rel = 'shortcut icon';
                    shortcutLink.type = 'image/png';
                    shortcutLink.href = faviconUrl;
                    document.head.appendChild(shortcutLink);

                    // Create larger icon for apple-touch-icon
                    const appleCanvas = document.createElement('canvas');
                    const appleCtx = appleCanvas.getContext('2d');
                    if (!appleCtx) return;

                    appleCanvas.width = 180;
                    appleCanvas.height = 180;
                    appleCtx.drawImage(img, 0, 0, 180, 180);

                    appleCanvas.toBlob((appleBlob) => {
                        if (!appleBlob) return;
                        const appleFaviconUrl = URL.createObjectURL(appleBlob);
                        
                        const appleLink = document.createElement('link');
                        appleLink.rel = 'apple-touch-icon';
                        appleLink.href = appleFaviconUrl;
                        document.head.appendChild(appleLink);
                    }, 'image/png');
                }, 'image/png');
            } catch (error) {
                console.error('Failed to create favicon:', error);
                // Fallback to direct logo usage
                const link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.href = schoolLogo;
                document.head.appendChild(link);
            }
        };

        updateFavicon();
    }, [schoolName, schoolLogo]);

    return null;
}
