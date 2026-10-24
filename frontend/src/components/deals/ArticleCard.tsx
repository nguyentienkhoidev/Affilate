import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/deals';
import { Clock, ArrowRight } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'featured' | 'compact';
  featured?: boolean;
}

export default function ArticleCard({ 
  article, 
  variant = 'standard',
  featured = false,
}: ArticleCardProps) {
  const isFeatured = featured || variant === 'featured';
  
  // Compact list card (for sidebars or dense lists)
  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-3.5 pb-4 border-b border-[#E7E7E5] last:border-0 last:pb-0">
        <Link 
          href={`/post/${article.slug}`}
          className="relative w-20 h-16 sm:w-24 sm:h-18 rounded-md overflow-hidden shrink-0 bg-[#F8F8F6] border border-[#E7E7E5]"
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="100px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        <div className="space-y-1 flex-1">
          <span className="text-[10px] font-bold uppercase text-[#C62828] tracking-wider block">
            {article.category}
          </span>
          <h4 className="font-semibold text-xs sm:text-sm text-[#171717] group-hover:text-[#C62828] transition-colors leading-snug line-clamp-2">
            <Link href={`/post/${article.slug}`}>
              {article.title}
            </Link>
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-[#737373]">
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  // Featured split card (for 2-column hero highlights)
  if (isFeatured) {
    return (
      <article className="group bg-white rounded-lg border border-[#E7E7E5] hover:border-[#171717]/40 transition-all duration-300 overflow-hidden flex flex-col md:grid md:grid-cols-12 md:gap-6">
        <Link 
          href={`/post/${article.slug}`}
          className="relative overflow-hidden bg-[#F8F8F6] md:col-span-6 h-56 md:h-full min-h-[220px]"
        >
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-[#171717]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
              {article.category}
            </span>
          </div>
        </Link>

        <div className="p-5 md:p-6 md:col-span-6 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] text-[#737373]">
              <span>{article.publishedAt}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={11} /> {article.readTime}
              </span>
            </div>

            <h3 className="font-bold text-base md:text-lg text-[#171717] group-hover:text-[#C62828] transition-colors leading-snug line-clamp-2">
              <Link href={`/post/${article.slug}`}>
                {article.title}
              </Link>
            </h3>

            <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="pt-3 border-t border-[#E7E7E5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0 border border-[#E7E7E5]">
                <Image
                  src={article.author.avatar}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="font-medium text-[#171717] text-[11px]">{article.author.name}</span>
            </div>

            <Link
              href={`/post/${article.slug}`}
              className="text-xs font-semibold text-[#171717] group-hover:text-[#C62828] flex items-center gap-1 transition-colors"
            >
              <span>Read report</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Standard editorial card (default)
  return (
    <article className="group bg-white rounded-lg border border-[#E7E7E5] hover:border-[#171717]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      <Link 
        href={`/post/${article.slug}`}
        className="relative overflow-hidden bg-[#F8F8F6] block aspect-[16/10]"
      >
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2.5 left-2.5">
          <span className="bg-[#171717]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
            {article.category}
          </span>
        </div>
      </Link>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[11px] text-[#737373]">
            <span>{article.publishedAt}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {article.readTime}
            </span>
          </div>

          <h3 className="font-semibold text-sm sm:text-base text-[#171717] group-hover:text-[#C62828] transition-colors leading-snug line-clamp-2">
            <Link href={`/post/${article.slug}`}>
              {article.title}
            </Link>
          </h3>

          <p className="text-xs text-[#737373] line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-[#E7E7E5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full overflow-hidden relative shrink-0 border border-[#E7E7E5]">
              <Image
                src={article.author.avatar}
                alt={article.author.name}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-medium text-[#737373] text-[11px]">{article.author.name}</span>
          </div>

          <Link
            href={`/post/${article.slug}`}
            className="text-xs font-semibold text-[#171717] group-hover:text-[#C62828] flex items-center gap-1 transition-colors"
          >
            <span>Read review</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
