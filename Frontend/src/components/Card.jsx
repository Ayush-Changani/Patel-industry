const Card = ({ title, children }) => {
  return (
    <div className="bg-[#ebe2cd] border border-[#393E46] rounded-xl p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Title/Header */}
      {title && (
        <h1 className="text-3xl font-bold text-[#222831] mb-6 border-b-2 border-[#393E46] pb-2">
          {title}
        </h1>
      )}

      {/* Card content */}
      {children}
    </div>
  );
};

export default Card;