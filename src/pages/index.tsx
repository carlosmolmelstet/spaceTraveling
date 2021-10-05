import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic  from '@prismicio/client';
import { RichText }  from 'prismic-dom';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface Posts2 {
  slug: string;
  title:  string;
  subtitle:string;
}

interface HomeProps {
  postsPagination: Posts2[];
}

export default function Home({postsPagination}: HomeProps) {
  console.log(postsPagination);
  return(
    <>
     {postsPagination.map(post => (
       <div key={post.slug}>
        <h1>{post.title}</h1>
        <p>{post.subtitle}</p>
       </div>
      ))}
    
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.Predicates.at('document.type', 'posts')]);

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: post.data.title,
      subtitle:post.data.subtitle,
    }
  })


  return {
    props: {
      postsPagination: posts
    }
  } 
};
