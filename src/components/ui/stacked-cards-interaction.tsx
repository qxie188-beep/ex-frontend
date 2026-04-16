"use client";

import React, { useState } from "react";

const Card = ({
  className,
  image,
  children,
  onClick,
  onEdit,
  onDelete,
}: {
  className?: string;
  image?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) => {
  const [showButtons, setShowButtons] = React.useState(false);
  const [longPressTimer, setLongPressTimer] = React.useState<NodeJS.Timeout | null>(null);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 500);
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleMouseLeave = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setShowButtons(false);
  };

  return (
    <div
      style={{
        width: "350px",
        cursor: "pointer",
        height: "400px",
        overflow: "hidden",
        backgroundColor: "white",
        borderRadius: "1rem",
        boxShadow: "0 0 10px rgba(0,0,0,0.02)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        position: "relative",
        ...(className ? { className } : {})
      }}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchCancel={handleMouseUp}
    >
      {image ? (
        <div style={{
          position: "relative",
          height: "18rem",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          width: "calc(100% - 1rem)",
          marginLeft: "0.5rem",
          marginTop: "0.5rem"
        }}>
          <img
            src={image}
            alt="card"
            style={{
              objectFit: "cover",
              marginTop: 0,
              width: "100%",
              height: "100%"
            }}
          />
        </div>
      ) : (
        <div style={{
          position: "relative",
          height: "18rem",
          borderRadius: "0.75rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          overflow: "hidden",
          width: "calc(100% - 1rem)",
          marginLeft: "0.5rem",
          marginTop: "0.5rem",
          backgroundColor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            fontSize: "48px",
            color: "#d1d5db"
          }}>📷</div>
        </div>
      )}
      {children && (
        <div style={{
          padding: "0 1rem 0.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem"
        }}>{children}</div>
      )}
      {showButtons && (onEdit || onDelete) && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          animation: "fadeIn 0.3s ease-in-out"
        }}>
          <div style={{
            display: "flex",
            gap: "1rem",
            animation: "scaleIn 0.3s ease-out"
          }}>
            {onEdit && (
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  animation: "flyInLeft 0.3s ease-out"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setShowButtons(false);
                }}
              >
                编辑
              </button>
            )}
            {onDelete && (
              <button
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ef4444",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "white",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  animation: "flyInRight 0.3s ease-out"
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowButtons(false);
                }}
              >
                删除
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface CardData {
  id: string;
  image: string;
  title: string;
  description: string;
}

const StackedCardsInteraction = ({
  cards,
  spreadDistance = 40,
  rotationAngle = 5,
  animationDelay = 0.1,
  onCardClick,
  onCardEdit,
  onCardDelete,
}: {
  cards: CardData[];
  spreadDistance?: number;
  rotationAngle?: number;
  animationDelay?: number;
  onCardClick?: (id: string) => void;
  onCardEdit?: (id: string) => void;
  onCardDelete?: (id: string) => void;
}) => {
  const [isHovering, setIsHovering] = useState(false);

  // Limit to maximum of 3 cards
  const limitedCards = cards.slice(0, 3);

  return (
    <div style={{
      position: "relative",
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        position: "relative",
        width: "350px",
        height: "400px"
      }}>
        {limitedCards.map((card, index) => {
          const isFirst = index === 0;

          let xOffset = 0;
          let rotation = 0;

          if (limitedCards.length > 1) {
            // First card stays in place
            // Second card goes left
            // Third card goes right
            if (index === 1) {
              xOffset = -spreadDistance;
              rotation = -rotationAngle;
            } else if (index === 2) {
              xOffset = spreadDistance;
              rotation = rotationAngle;
            }
          }

          return (
            <div
              key={card.id}
              style={{
                position: "absolute",
                zIndex: isFirst ? 10 : 0,
                transform: `translateX(${isHovering ? xOffset : 0}px) rotate(${isHovering ? rotation : 0}deg)`,
                transition: `transform 0.3s ease-in-out ${index * animationDelay}s`
              }}
              onMouseEnter={() => isFirst && setIsHovering(true)}
              onMouseLeave={() => isFirst && setIsHovering(false)}
            >
              <Card
                image={card.image || undefined}
                onClick={() => onCardClick?.(card.id)}
                onEdit={() => onCardEdit?.(card.id)}
                onDelete={() => onCardDelete?.(card.id)}
              >
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { StackedCardsInteraction, Card };