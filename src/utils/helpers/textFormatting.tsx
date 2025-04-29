import React from 'react';

interface RenderHighlightedTextProps {
  text: string | undefined;
  highlightClassName: string;
  fallback: React.ReactNode;
}

export const renderHighlightedText = ({ 
  text, 
  highlightClassName, 
  fallback 
}: RenderHighlightedTextProps): JSX.Element => {
  if (!text) {
    return <>{fallback}</>;
  }

  const parts = text.split(/\[highlight\](.*?)\[\/highlight\]/g);
  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span key={index} className={highlightClassName}>
              {part}
            </span>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </>
  );
}; 