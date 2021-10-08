import { GetStaticProps } from 'next';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from "react-icons/fi";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import React, { ReactElement, useState } from 'react';
import Post from './post/[slug]';


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

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  postsPagination}: HomeProps): ReactElement {
  const formattedPost = postsPagination.results.map(post => {
    return {
      ...post,
      first_publication_date: format(
        new Date(post.first_publication_date),
        'dd MMM yyyy',
        {
          locale: ptBR,
        }
      ),
    };
  });

  const [posts, setPosts] = useState(formattedPost);
  const [nextPageLink, setNextPageLink] = useState(postsPagination.next_page);

  function HandleNextPage() {
    fetch(nextPageLink)
      .then(response => response.json())
      .then(data  => {
        setNextPageLink(data.next_page);
        const newPosts = data.results.map(post => {
          return {
            uid: post.uid,
            first_publication_date: format(
              new Date(post.first_publication_date),
              'dd MMM yyyy',
              {
                locale: ptBR,
              }
            ),
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            },
          };
        });
        
        setPosts([...posts, ...newPosts ]);
      })

  }

  return (
    <>
      <Header />
      <div className={styles.wrapper}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`}>
          <div className={styles.post} key={post.uid}>
            <h3>{post.data.title}</h3>
            <p>{post.data.subtitle}</p>
            <span>
              <FiCalendar />
              {post.first_publication_date}
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
          </div>
          </Link>
        ))}
        {nextPageLink != null ? <span className={styles.nextPage} onClick={HandleNextPage}>Carregar mais posts</span> : ""}
      </div>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([Prismic.Predicates.at('document.type', 'posts')],
  { 
    pageSize: 3,
    orderings: '[document.last_publication_date desc]',
  });

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle:  post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }
};
