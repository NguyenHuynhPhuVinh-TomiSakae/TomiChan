import React, { useState, useRef, useEffect, ReactNode } from "react";

interface MenuProps {
  trigger: ReactNode;
  children: ReactNode;
}

export const Menu: React.FC<MenuProps> = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện lan truyền lên các phần tử cha
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={handleTriggerClick}>{trigger}</div>

      {isOpen && (
        <div className="absolute right-0 mt-1 py-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      )}
    </div>
  );
};

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  className = "",
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện lan truyền
    onClick(e);
  };

  return (
    <button
      className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      onClick={handleClick}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </button>
  );
};
