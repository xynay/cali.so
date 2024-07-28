import { groq } from 'next-sanity';
import { getDate } from '~/lib/date';
import { client } from '~/sanity/lib/client';
import { type Post, type PostDetail } from '~/sanity/schemas/post';
import { type Project } from '~/sanity/schemas/project';

// Cache the current date to avoid recalculating it multiple times
const currentDate = getDate().toISOString();

// Query to fetch all latest blog post slugs
export const getAllLatestBlogPostSlugsQuery = () =>
  groq`
  *[_type == "post" && !(_id in path("drafts.**")) 
  && publishedAt <= "${currentDate}" 
  && defined(slug.current)] | order(publishedAt desc).slug.current
  `;

export const getAllLatestBlogPostSlugs = () => {
  return client.fetch<string[]>(getAllLatestBlogPostSlugsQuery());
};

// Options type for fetching blog posts
type GetBlogPostsOptions = {
  limit?: number;
  offset?: number;
  forDisplay?: boolean;
};

// Query to fetch latest blog posts
export const getLatestBlogPostsQuery = ({
  limit = 5,
  offset = 0,
  forDisplay = true,
}: GetBlogPostsOptions) =>
  groq`
  *[_type == "post" && !(_id in path("drafts.**")) 
  && publishedAt <= "${currentDate}" 
  && defined(slug.current)] | order(publishedAt desc)[${offset}...${offset + limit}] {
    _id,
    title,
    "slug": slug.current,
    "categories": categories[]->title,
    description,
    publishedAt,
    readingTime,
    mainImage {
      _ref,
      asset->{
        url,
        ${forDisplay ? '"lqip": metadata.lqip, "dominant": metadata.palette.dominant,' : ''}
      }
    }
  }`;

export const getLatestBlogPosts = (options: GetBlogPostsOptions) => 
  client.fetch<Post[] | null>(getLatestBlogPostsQuery(options));

// Query to fetch a single blog post by slug
export const getBlogPostQuery = groq`
  *[_type == "post" && slug.current == $slug && !(_id in path("drafts.**"))][0] {
    _id,
    title,
    "slug": slug.current,
    "categories": categories[]->title,
    description,
    publishedAt,
    readingTime,
    mood,
    body[] {
      ...,
      _type == "image" => {
        "url": asset->url,
        "lqip": asset->metadata.lqip,
        "dimensions": asset->metadata.dimensions,
        ...
      }
    },
    "headings": body[length(style) == 2 && string::startsWith(style, "h")],
    mainImage {
      _ref,
      asset->{
        url,
        "lqip": metadata.lqip
      }
    },
    "related": *[_type == "post" && slug.current != $slug 
      && count(categories[@._ref in ^.^.categories[]._ref]) > 0] 
      | order(publishedAt desc, _createdAt desc) [0..2] {
      _id,
      title,
      "slug": slug.current,
      "categories": categories[]->title,
      publishedAt,
      readingTime,
      mainImage {
        _ref,
        asset->{
          url,
          "lqip": metadata.lqip,
          "dominant": metadata.palette.dominant
        }
      }
    }
  }`;

export const getBlogPost = (slug: string) =>
  client.fetch<PostDetail | undefined, { slug: string }>(getBlogPostQuery, { slug });

// Query to fetch settings
export const getSettingsQuery = () =>
  groq`
  *[_type == "settings"][0] {
    "projects": projects[]->{
      _id,
      name,
      url,
      description,
      icon
    },
    "heroPhotos": heroPhotos[].asset->url,
    "resume": resume[]{
      company,
      title,
      start,
      end,
      "logo": logo.asset->url
    }
  }`;

export const getSettings = () =>
  client.fetch<{
    projects: Project[] | null;
    heroPhotos?: string[] | null;
    resume?: {
      company: string;
      title: string;
      logo: string;
      start: string;
      end?: string;
    }[] | null;
  }>(getSettingsQuery());