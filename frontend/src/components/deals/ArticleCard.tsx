import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { Article } from '@/types/deals';
import { Clock, ArrowRight, FileText } from 'lucide-react';

interface ArticleCardProps {
  article: Article;
  variant?: 'standard' | 'featured' | 'compact';
  featured?: boolean;
}

function AuthorAvatar({ name, avatar }: { name: string; avatar?: string }) {
  const initial = (name || 'E').trim().charAt(0).toUpperCase();
  if (avatar && avatar.trim()) {
    return (
      <div className="w-6 h-6 rounded-full overflow-hidden relative shrink-0 ring-2 ring-slate-100 shadow-2xs bg-slate-100">
        <Image src={avatar} alt={name} fill sizes="24px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className="w-6 h-6 rounded-full shrink-0 ring-2 ring-slate-100 bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
      {initial}
    </div>
  );
}

function CoverVisual({
  imageUrl,
  title,
  sizes,
}: {
  imageUrl?: string;
  title: string;
  sizes: string;
}) {
  if (imageUrl && imageUrl.trim()) {
    return (
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes={sizes}
        className="object-cover group-hover:scale-108 transition-transform duration-700"
      />
    );
  }
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 text-slate-400">
      <FileText size={28} className="opacity-60" />
    </div>
  );
}

export default function ArticleCard({
  article,
  variant = 'standard',
  featured = false,
}: ArticleCardProps) {
  const isFeatured = featured || variant === 'featured';
  const postHref = ROUTES.PUBLIC.POST_DETAIL(article.slug);

  // Compact list card (for sidebars or dense lists)
  if (variant === 'compact') {
    return (
      <article className="group flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
        <Link
          href={postHref}
          className="relative w-20 h-16 sm:w-24 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 shadow-2xs"
        >
          <CoverVisual imageUrl={article.imageUrl} title={article.title} sizes="100px" />
        </Link>
        <div className="space-y-1.5 flex-1 min-w-0">
          <span className="text-[10px] font-black uppercase text-red-700 tracking-wider block">
            {article.category}
          </span>
          <h4 className="font-bold text-xs sm:text-sm text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
            <Link href={postHref}>{article.title}</Link>
          </h4>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
            {article.publishedAt && (
              <>
                <span>{article.publishedAt}</span>
                <span>•</span>
              </>
            )}
            <span>{article.readTime}</span>
          </div>
        </div>
      </article>
    );
  }

  // Featured split card (for 2-column hero highlights)
  if (isFeatured) {
    return (
      <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col md:grid md:grid-cols-12 md:gap-6 shadow-xs hover:shadow-xl hover:-translate-y-1">
        <Link
          href={postHref}
          className="relative overflow-hidden bg-slate-100 md:col-span-6 h-56 md:h-full min-h-[240px]"
        >
          <CoverVisual
            imageUrl={article.imageUrl}
            title={article.title}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20 shadow-sm">
              {article.category}
            </span>
          </div>
        </Link>

        <div className="p-5 md:p-6 md:col-span-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
              {article.publishedAt && (
                <>
                  <span>{article.publishedAt}</span>
                  <span>•</span>
                </>
              )}
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" /> {article.readTime}
              </span>
            </div>

            <h3 className="font-extrabold text-base md:text-lg text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
              <Link href={postHref}>{article.title}</Link>
            </h3>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AuthorAvatar name={article.author.name} avatar={article.author.avatar} />
              <span className="font-semibold text-slate-800 text-[11px]">{article.author.name}</span>
            </div>

            <Link
              href={postHref}
              className="text-xs font-bold text-slate-950 group-hover:text-red-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Read report</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // Standard editorial card (default)
  return (
    <article className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-xl hover:-translate-y-1">
      <Link href={postHref} className="relative overflow-hidden bg-slate-100 block aspect-[16/10]">
        <CoverVisual
          imageUrl={article.imageUrl}
          title={article.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <span className="bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20 shadow-sm">
            {article.category}
          </span>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
            {article.publishedAt && (
              <>
                <span>{article.publishedAt}</span>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-slate-400" /> {article.readTime}
            </span>
          </div>

          <h3 className="font-extrabold text-base text-slate-950 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
            <Link href={postHref}>{article.title}</Link>
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{article.excerpt}</p>
        </div>

        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AuthorAvatar name={article.author.name} avatar={article.author.avatar} />
            <span className="font-semibold text-slate-700 text-[11px]">{article.author.name}</span>
          </div>

          <Link
            href={postHref}
            className="text-xs font-bold text-slate-950 group-hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <span>Read review</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
