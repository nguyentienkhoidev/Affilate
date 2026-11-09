import { type CategoryData } from './data';
import { type AdminArticle } from '../../posts/_lib/data';

/**
 * Robustly matches an article to a category by slug, name, tags, or taxonomy keywords.
 */
export function matchArticleToCategory(article: AdminArticle, category: CategoryData): boolean {
  if (!category || !article) return false;

  const catSlug = (category.slug || '').toLowerCase().trim();
  const catName = (category.name || '').toLowerCase().trim();
  const artCat = (article.category || '').toLowerCase().trim();
  const artTags = (article.tags || []).map((t) => (t || '').toLowerCase().trim());
  const artTitle = (article.title || '').toLowerCase().trim();
  const artSlug = (article.slug || '').toLowerCase().trim();

  // 1. Direct equality
  if (artCat === catSlug || artCat === catName) return true;

  // 2. Mutual inclusion (e.g., "Technology & Gear" vs "Tech" or "Technology")
  if (artCat.includes(catSlug) || (catSlug.length > 2 && catSlug.includes(artCat))) return true;
  if (artCat.includes(catName) || (catName.length > 2 && catName.includes(artCat))) return true;

  // 3. Taxonomy semantics
  if (catSlug === 'tech' && (artCat.includes('gear') || artCat.includes('computing') || artCat.includes('hardware') || artCat.includes('audio') || artCat.includes('gadgets'))) {
    return true;
  }
  if (catSlug === 'reviews' && (artCat.includes('review') || artSlug.includes('review') || artTitle.includes('review') || artTags.includes('reviews'))) {
    return true;
  }
  if (catSlug === 'lifestyle' && (artCat.includes('home') || artCat.includes('wellness') || artCat.includes('living') || artCat.includes('food') || artCat.includes('drink') || artCat.includes('sleep'))) {
    return true;
  }
  if (catSlug === 'entertainment' && (artCat.includes('fashion') || artCat.includes('culture') || artCat.includes('pop') || artCat.includes('collectibles') || artCat.includes('sabers') || artCat.includes('movies'))) {
    return true;
  }
  if (catSlug === 'us-politics' && (artCat.includes('politics') || artCat.includes('policy') || artCat.includes('tariffs') || artCat.includes('trade') || artCat.includes('global'))) {
    return true;
  }
  if (catSlug === 'business' && (artCat.includes('business') || artCat.includes('economy') || artCat.includes('commerce') || artCat.includes('growth') || artCat.includes('fintech'))) {
    return true;
  }

  // 4. Match tags
  if (artTags.some((t) => t === catSlug || t === catName || (t.length > 2 && (t.includes(catSlug) || catSlug.includes(t))))) {
    return true;
  }

  return false;
}

/**
 * Get all articles belonging to a specific category.
 */
export function getCategoryArticles(category: CategoryData, articles: AdminArticle[]): AdminArticle[] {
  if (!category || !Array.isArray(articles)) return [];
  return articles.filter((art) => matchArticleToCategory(art, category));
}
