interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors ${className}`}>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}