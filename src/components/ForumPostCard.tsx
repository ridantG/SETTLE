
type ForumPostCardProps = {
    title: string;
    content: string;
    author: string;
    date: string;
  };
  
  const ForumPostCard = ({ title, content, author, date }: ForumPostCardProps) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          by <span className="font-semibold">{author}</span> on {date}
        </p>
        <p className="text-gray-600 mt-4">{content}</p>
      </div>
    );
  };
  
  export default ForumPostCard;