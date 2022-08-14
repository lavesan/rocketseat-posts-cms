import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ReactElement, Fragment as ReactFragment } from 'react';
import * as prismicH from '@prismicio/helpers';
import { RTNode } from '@prismicio/types';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '..';

type ContentBody = [] | [RTNode, ...RTNode[]];

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
      body: ContentBody;
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): ReactElement {
  const router = useRouter();

  if (router.isFallback) return <p>Carregando...</p>;

  const bodyToHTML = (body: ContentBody): { __html: string } => {
    return { __html: prismicH.asHTML(body) };
  };

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
          <ReactFragment key={content.heading}>
            <h2 className={styles.heading}>{content.heading}</h2>
            <div
              className={styles.body}
              dangerouslySetInnerHTML={bodyToHTML(content.body)}
            />
          </ReactFragment>
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
