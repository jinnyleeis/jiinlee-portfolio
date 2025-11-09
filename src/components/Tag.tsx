"use client";

import React from "react";
import clsx from "clsx";

interface TagProps {
  size?: "small" | "medium";
  variant?: 1 | 2 | 3 | number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Tag: React.FC<TagProps> = ({
  size = "small",
  variant = 1,
  children,
  className,
  style,
}) => {
  const sizeStyle = {
    small: "label-14_sb rounded-[5px]",
    medium: "label-14_sb rounded-[5.909px]",
  }[size];

  const baseStyle = "inline-flex items-center px-[6px] py-[4px]";

  const variantStyle = (() => {
    switch (variant) {
      case 1:
        return "bg-[#FFF1C9] text-[#7A5600]";
      case 2:
        return "bg-transparent text-accent-blue border rounded-[5.909px] border-accent-blue border-[1.182px]";
      case 3:
        return "bg-[#E7F8E5] text-[#1B5E20]";
      default:
        return "";
    }
  })();

  return (
    <span
      className={clsx(baseStyle, sizeStyle, variantStyle, className)}
      style={style}
    >
      {children}
    </span>
  );
};
