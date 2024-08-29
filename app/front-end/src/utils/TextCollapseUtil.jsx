import React, { useState } from 'react';

const TextCollapseUtil = ({ text }) => {
  // State to handle whether the text is expanded or collapsed
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle the expansion state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      {/* Conditionally apply the class to limit height to 3 lines */}
      <p className={`font-arima ${!isExpanded ? 'line-clamp-3' : ''}`}>
        {text}
      </p>

      {/* Toggle Button */}
      <button 
        className="text-blue-500 mt-2"
        onClick={toggleExpanded}
      >
        {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
};

export default TextCollapseUtil;
