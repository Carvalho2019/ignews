import styles from './styles.module.scss'
import Head from 'next/head'
import { GetStaticProps } from 'next'
import { createClient } from '../../services/prismic'
import Link from 'next/link'

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  updatedAt: string;
}

interface PostsProps {
  posts: Post[]
}

export default function Posts({ posts }: PostsProps) {
  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.container}>
        <div className={styles.posts}>
          { posts.map(post => (
            <Link key={post.slug} href={`/posts/${post.slug}`}>
              <a >
                <time>{post.updatedAt}</time>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
              </a>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const client = createClient()

  const pages = await client.getAllByType('posts', {
    orderings: {
      field: 'data.title',
      direction: 'desc',
    },
    lang: 'pt-pt',
  })
  //console.log(JSON.stringify(pages, null, 2));

  const posts = pages.map(post => {
    return {
      slug: post.uid,
      title: post.data.title[0].text,
      excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-pt', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    }
  })

  return {
    props: { posts }, // Will be passed to the page component as props
  }
}