import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  width?: string | number;
  height?: string | number;
  interval?: string;
  timezone?: string;
  theme?: 'light' | 'dark';
  style?: string;
  locale?: string;
  allowSymbolChange?: boolean;
  saveImage?: boolean;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  width = "100%",
  height = "100%",
  interval = "1",
  timezone = "Etc/UTC",
  theme = "dark",
  style = "1",
  locale = "en",
  allowSymbolChange = false,
  saveImage = false,
  className = ""
}) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    // Clear any existing content safely
    const currentContainer = container.current;
    while (currentContainer.firstChild) {
      currentContainer.removeChild(currentContainer.firstChild);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      width,
      height,
      symbol,
      interval,
      timezone,
      theme,
      style,
      locale,
      allow_symbol_change: allowSymbolChange,
      save_image: saveImage,
      support_host: "https://www.tradingview.com"
    });

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    
    // Create copyright container
    const copyrightContainer = document.createElement('div');
    copyrightContainer.className = 'tradingview-widget-copyright';
    copyrightContainer.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets on TradingView</span></a>';

    currentContainer.appendChild(widgetContainer);
    currentContainer.appendChild(copyrightContainer);
    currentContainer.appendChild(script);

    return () => {
      // Safer cleanup
      if (currentContainer && currentContainer.parentNode) {
        try {
          while (currentContainer.firstChild) {
            currentContainer.removeChild(currentContainer.firstChild);
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, [symbol, width, height, interval, timezone, theme, style, locale, allowSymbolChange, saveImage]);

  return (
    <div 
      className={`tradingview-widget-container ${className}`} 
      ref={container}
      style={{ width: typeof width === 'number' ? `${width}px` : width, height: typeof height === 'number' ? `${height}px` : height }}
    />
  );
};

export default TradingViewChart;