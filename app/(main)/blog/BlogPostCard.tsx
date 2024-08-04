import { parseDateTime } from '@zolplay/utils';
import Image from 'next/image';
import Link from 'next/link';
import { memo } from 'react';

import { CalendarIcon, HourglassIcon, ScriptIcon } from '~/assets';
import { type Post } from '~/sanity/schemas/post';

const BlogPostCard = memo(({ post }: { post: Post }) => {
  const { title, slug, mainImage, publishedAt, categories, readingTime } = post;
  const { dominant: { foreground, background } = {}, url: imageUrl, lqip } = mainImage.asset;

  const formattedDate = parseDateTime({ date: new Date(publishedAt) })?.format('YYYY/MM/DD');

  return (
    <Link
      href={`/blog/${slug}`}
      prefetch={false}
      className="group relative flex w-full transform-gpu flex-col rounded-3xl bg-transparent ring-2 ring-[--post-image-bg] transition-transform hover:-translate-y-0.5"
      style={{
        '--post-image-fg': foreground,
        '--post-image-bg': background,
        '--post-image': `url(${imageUrl})`,
      } as React.CSSProperties}
    >
      <div className="relative aspect-[240/135] w-full">
        <Image
          src={imageUrl}
          alt={title}
          className="rounded-t-3xl object-cover"
          placeholder="blur"
          blurDataURL={lqip}
          layout="responsive"
          width={240}
          height={135}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw"
          loading="lazy"
        />
      </div>
      <span className="relative z-10 flex w-full flex-1 shrink-0 flex-col justify-between gap-0.5 rounded-b-[calc(1.5rem+1px)] bg-cover bg-bottom bg-no-repeat p-4 bg-blend-overlay [background-image:var(--post-image)] before:pointer-events-none before:absolute before:inset-0 before:z-10 before:select-none before:rounded-b-[calc(1.5rem-1px)] before:bg-[--post-image-bg] before:opacity-70 before:transition-opacity after:pointer-events-none after:absolute after:inset-0 after:z-10 after:select-none after:rounded-b-[calc(1.5rem-1px)] after:bg-gradient-to-b after:from-transparent after:to-[--post-image-bg] after:backdrop-blur after:transition-opacity group-hover:before:opacity-30 md:p-5">
        <h2 className="z-20 text-base font-bold tracking-tight text-[--post-image-fg] opacity-70 transition-opacity group-hover:opacity-100 md:text-xl">
          {title}
        </h2>
        <span className="relative z-20 flex items-center justify-between opacity-50 transition-opacity group-hover:opacity-80">
          <span className="inline-flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1 text-[12px] font-medium text-[--post-image-fg] md:text-sm">
              <CalendarIcon />
              <span>{formattedDate}</span>
            </span>
            {Array.isArray(categories) && (
              <span className="inline-flex items-center space-x-1 text-[12px] font-medium text-[--post-image-fg] md:text-sm">
                <ScriptIcon />
                <span>{categories.join(', ')}</span>
              </span>
            )}
          </span>
          <span className="inline-flex items-center space-x-3 text-[12px] font-medium text-[--post-image-fg] md:text-xs">
            <span className="inline-flex items-center space-x-1">
              <HourglassIcon />
              <span>{readingTime.toFixed(0)}分钟阅读</span>
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
});

BlogPostCard.displayName = 'BlogPostCard';

export { BlogPostCard };