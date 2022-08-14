import { GetStaticPaths, GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import * as prismicH from '@prismicio/helpers';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Head from 'next/head';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { formatDate } from '../';
import React from 'react';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback)
    return <p>Carregando...</p>

  return (
    <>
      <Head>
        <title>Post | {post.data.title}</title>
      </Head>

      <main className={styles.content}>
        <Header />

        <div
          className={styles.banner}
          style={{
            backgroundImage: `url(${post.data.banner.url})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        <h1 className={styles.title}>{post.data.title}</h1>

        <div className={styles.info}>
          <time>
            <FiCalendar className={styles.icon} />{' '}
            {formatDate(post.first_publication_date)}
          </time>
          <p>
            <FiUser className={styles.icon} /> {post.data.author}
          </p>
          <p>
            <FiClock className={styles.icon} /> 4 min
          </p>
        </div>

        {post.data.content.map(content => (
          <React.Fragment key={content.heading}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={{ __html: prismicH.asHTML(content.body) }}
            />
          </React.Fragment>
        ))}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  return {
    paths: posts.results.map(post => ({
      params: {
        slug: post.uid,
      },
    })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', slug as string);

  return {
    props: {
      post: response,
    },
  };
};
