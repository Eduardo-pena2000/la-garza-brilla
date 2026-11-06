import { useEffect, useState, type ReactNode } from "react";
import { getEquippedWallpaper, type WallpaperConfig } from "@/lib/wallpapers";

export function BrandBackground({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(getEquippedWallpaper());

  useEffect(() => {
    const handleUpdate = () => {
      setWallpaper(getEquippedWallpaper());
    };

    window.addEventListener("garza:wallpaper-updated", handleUpdate);
    return () => window.removeEventListener("garza:wallpaper-updated", handleUpdate);
  }, []);

  // Visual styling based on equipped wallpaper
  const getWallpaperStyles = () => {
    switch (wallpaper.id) {
      case "wp_feria":
        return {
          background: "linear-gradient(180deg, #220819 0%, #460f33 45%, #160410 100%)",
          orb1: "#f43f5e", // Rose fiesta
          orb2: "#fbbf24", // Amber marigold
          texture: "radial-gradient(rgba(244, 63, 94, 0.15) 1px, transparent 1px)",
          textureSize: "28px 28px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(244,63,94,0.18) 0%, transparent 70%)",
        };
      case "wp_cantina":
        return {
          background: "linear-gradient(180deg, #1c0e05 0%, #33180b 45%, #120703 100%)",
          orb1: "#f59e0b", // Whiskey amber
          orb2: "#ea580c", // Copper fire
          texture: "radial-gradient(rgba(245, 158, 11, 0.12) 1px, transparent 1px)",
          textureSize: "24px 24px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.16) 0%, transparent 70%)",
        };
      case "wp_cempasuchil":
        return {
          background: "linear-gradient(180deg, #150626 0%, #300b4e 45%, #0f031d 100%)",
          orb1: "#d946ef", // Mystical violet
          orb2: "#f59e0b", // Cempasúchil gold
          texture: "radial-gradient(rgba(217, 70, 239, 0.15) 1px, transparent 1px)",
          textureSize: "32px 32px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(217,70,239,0.2) 0%, transparent 70%)",
        };
      case "wp_michis":
        return {
          background: "linear-gradient(180deg, #190522 0%, #350b3d 45%, #0f0214 100%)",
          orb1: "#ec4899", // Neon pink
          orb2: "#f59e0b", // Sun gold
          texture: "radial-gradient(rgba(236, 72, 153, 0.15) 1px, transparent 1px)",
          textureSize: "28px 28px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(236,72,153,0.2) 0%, transparent 70%)",
        };
      case "wp_lomitos":
        return {
          background: "linear-gradient(180deg, #07190f 0%, #0d2f1d 45%, #040f09 100%)",
          orb1: "#10b981", // Emerald
          orb2: "#f97316", // Amber
          texture: "radial-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px)",
          textureSize: "28px 28px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.2) 0%, transparent 70%)",
        };
      case "wp_casino_oro":
        return {
          background: "linear-gradient(180deg, #021a10 0%, #063923 45%, #01140c 100%)",
          orb1: "#10b981", // Emerald felt
          orb2: "#f59e0b", // Imperial Gold
          texture: "radial-gradient(rgba(245, 158, 11, 0.18) 1px, transparent 1px)",
          textureSize: "26px 26px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.22) 0%, transparent 70%)",
        };
      case "wp_clasico":
      default:
        return {
          background: "var(--gradient-brand)",
          orb1: "var(--brand-cyan)",
          orb2: "var(--brand-pink)",
          texture: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          textureSize: "22px 22px",
          overlayGlow: "radial-gradient(ellipse at 50% 0%, rgba(0,229,255,0.12) 0%, transparent 70%)",
        };
    }
  };

  const currentTheme = getWallpaperStyles();

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden text-white transition-colors duration-700 ${className}`}
      style={{ background: currentTheme.background }}
    >
      {/* High-Resolution Illustrated Table Mat Wallpaper Backdrop */}
      {wallpaper.backgroundImage && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 opacity-60"
            style={{ backgroundImage: `url(${wallpaper.backgroundImage})` }}
          />
          {/* Subtle dark gradient overlay to guarantee perfect card and tabla readability */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 backdrop-blur-[0.5px]"
          />
        </>
      )}

      {/* Dynamic Ambient Top Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-96 opacity-60 transition-opacity duration-700"
        style={{ background: currentTheme.overlayGlow }}
      />

      {/* Decorative blurred orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full opacity-30 blur-3xl transition-all duration-700"
        style={{ background: currentTheme.orb1 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl transition-all duration-700"
        style={{ background: currentTheme.orb2 }}
      />

      {/* Subtle texture grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] transition-all duration-700"
        style={{
          backgroundImage: currentTheme.texture,
          backgroundSize: currentTheme.textureSize,
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}