import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

export const formatDate = (date: string) =>
  format(new Date(date), 'dd LLL yyyy', {
    locale: ptBR,
  });

const mapPosts = (postsResponse: any) => {
  return {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(result => ({
      uid: result.uid,
      first_publication_date: result.first_publication_date,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
    })),
  };
};

export default function Home({ postsPagination }: HomeProps): any {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  const loadMore = async () => {
    if (posts.next_page) {
      const response = await fetch(postsPagination.next_page).then(res =>
        res.json()
      );

      setPosts(actual => {
        const mappedPosts = mapPosts(response);
        return {
          next_page: mappedPosts.next_page,
          results: [...actual.results, ...mappedPosts.results],
        };
      });
    }
  };

  return (
    <>
      <Head>
        <title>Posts</title>
      </Head>

      <main className={styles.content}>
        <div>
          <Header />

          {posts.results.map(result => (
            <Link href={`/post/${result.uid}`}>
              <button key={result.uid} type="button" className={styles.post}>
                <h3>{result.data.title}</h3>
                <p className={styles.subtitle}>{result.data.subtitle}</p>
                <div className={styles.postFooter}>
                  <time>
                    <FiCalendar className={styles.icon} />{' '}
                    {formatDate(result.first_publication_date)}
                  </time>
                  <p>
                    <FiUser className={styles.icon} /> {result.data.author}
                  </p>
                </div>
              </button>
            </Link>
          ))}
          {posts.next_page && (
            <button
              type="button"
              className={styles.loadPosts}
              onClick={loadMore}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['publication.title', 'publication.subtitle', 'publication.author'],
    pageSize: 1,
    page: 1,
  });

  return {
    props: {
      postsPagination: mapPosts(postsResponse),
    },
    revalidate: 60 * 60 * 24,
  };
};
