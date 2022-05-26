import { asHTML } from "@prismicio/helpers";
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/client"
import Head from "next/head";
import { createClient } from "../../services/prismic"
import styles from './post.module.scss'


interface PostProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Head>
        <title> {post.title} | Ignews </title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div className={styles.postContent} dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {

  const session = await getSession({ req })
  const { slug } = params

  if (!session?.activeSubscription) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
  const client = createClient()

  const response = await client.getByUID('posts', slug.toString())

  const post = {
    slug,
    title: response.data.title[0].text,
    content: asHTML(response.data.content),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-pt', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }


  return {
    props: { post }, // Will be passed to the page component as props
  }

}