import React from "react";

// Define the props type
interface PrimaryButtonProps {
  text?: string; // Optional label for the button
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Optional onClick handler
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ text, onClick }) => {
  // Define the style for the button
  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#000", // Solid black background
    color: "#fff", // White text
    padding: "12px 24px", // Padding for the button
    borderRadius: "10px", // Rounded corners
    border: "none", // No border
    fontSize: "18px", // Adjust the font size
    fontWeight: "bold", // Bold text for emphasis
    cursor: "pointer", // Pointer cursor on hover
    display: "inline-flex", // Flexbox for potential icons or text
    alignItems: "center", // Vertically align items
    justifyContent: "center", // Center the text
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
    transition: "transform 0.2s ease, box-shadow 0.2s ease", // Smooth hover effects
  };

  // Define hover effect (for desktop)
  const handleHover = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 6px 8px rgba(0, 0, 0, 0.2)";
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  };

  // Define touch effect (for mobile/touch devices)
  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.transform = "scale(0.95)";
    e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>): void => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
  };

  return (
    <button
      style={buttonStyle}
      onMouseOver={handleHover}
      onMouseOut={handleMouseOut}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
    >
      {text || ""} {/* Default text if label is not provided */}
    </button>
  );
};

export default PrimaryButton;
