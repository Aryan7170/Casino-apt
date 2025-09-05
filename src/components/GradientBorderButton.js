"use client";
import React from "react";

export default function GradientBorderButton({
  children,
  className = "",
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    console.log('GradientBorderButton clicked'); // Debug log
    if (onClick) {
      e.stopPropagation(); // Prevent event bubbling
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`gradient-border-button bg-gradient-to-r from-red-magic to-blue-magic hover:from-blue-magic hover:to-red-magic rounded-sm p-0.5 cursor-pointer ${className}`}
      {...props}
    >
      <div className="bg-[#070005] rounded-sm px-4 h-full justify-center font-display py-1 flex items-center text-white">
        {children}
      </div>
    </button>
  );
}
