"use client";
import React from "react";

export default function GradientBorderButton({ children, className = "", onClick, ...props }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-red-magic to-blue-magic hover:from-blue-magic hover:to-red-magic rounded-sm p-0.5 cursor-pointer ${className}`}
      {...props}
    >
      <div className="bg-[#070005] rounded-sm px-4 h-full justify-center font-display py-1 flex items-center text-white">
        {children}
      </div>
    </button>
  );
}
