interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 ${
        hover ? 'hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all cursor-pointer' : ''
      } ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`px-6 py-4 border-b border-gray-100 dark:border-gray-700 ${className ?? ''}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className ?? ''}`}>{children}</div>;
};
