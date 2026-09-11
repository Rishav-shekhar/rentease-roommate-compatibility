"use client";

import { useEffect } from "react";

export default function AdSlot() {
  useEffect(() => {
    try {
      const adsbygoogle =
        (window as any).adsbygoogle ||
        [];

      adsbygoogle.push({});
    } catch (error) {
      console.error(
        "AdSense error:",
        error
      );
    }
  }, []);

  return (
    <div className="ad-slot">
      <span className="ad-slot-label">
        Sponsored
      </span>

      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-client="ca-pub-1483251530712082"
        data-ad-slot="2434337006"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}