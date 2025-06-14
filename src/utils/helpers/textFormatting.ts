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
}: RenderHighlightedTextProps): React.ReactNode => {
  if (!text) {
    return fallback;
  }

  const parts = text.split(/\[highlight\](.*?)\[\/highlight\]/g);
  return React.createElement(
    React.Fragment,
    null,
    parts.map((part, index) => {
      if (index % 2 === 1) {
        return React.createElement(
          'span',
          {
            key: index,
            className: highlightClassName
          },
          part
        );
      }
      return React.createElement(
        React.Fragment,
        { key: index },
        part
      );
    })
  );
}; 