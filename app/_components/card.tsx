import Link from "next/link";

interface CardProps extends React.HTMLAttributes<HTMLAnchorElement> {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
}

const Card = ({ title, description, icon, link, ...props }: CardProps) => (
  <Link href={link} {...props}>
    <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg hover:bg-slate-50 shadow-lg sm:h-72 h-fit  justify-center">
      <div className="p-2 bg-opacity-50 rounded-full">{icon}</div>
      <h2 className="text-xl font-bold text-blue-800">{title}</h2>
      <p className="text-gray-800">{description}</p>
    </div>
  </Link>
);

export default Card;
