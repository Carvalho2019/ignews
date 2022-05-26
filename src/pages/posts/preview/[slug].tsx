import { asHTML } from "@prismicio/helpers";
import { GetStaticPaths, GetStaticProps } from "next"
import { getSession, useSession } from "next-auth/client"
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { createClient } from "../../../services/prismic"
import styles from '../post.module.scss'


interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  }
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession()
  const router = useRouter()

  useEffect(()=> {
    if(session?.activeSubscription){
      router.push(`/posts/${post.slug}`)
    }
  }, [session])

  return (
    <>
      <Head>
        <title> {post.title} | Ignews </title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          <div className={`${styles.postContent} ${styles.previewContent}`} dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className={styles.continueReading}>
            wanna continue reading?
            <Link href="/">
              <a>
                Subscribe now 🤗
              </a>
            </Link>
          </div>
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  console.log(params);

  const { slug } = params

  const client = createClient()

  const response = await client.getByUID('posts', slug.toString())

  const post = {
    slug,
    title: response.data.title[0].text,
    content: asHTML(response.data.content.splice(0, 3)),
    updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-pt', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }


  return {
    props: { post }, // Will be passed to the page component as props
    redirect: 60 * 30 , // 30 minutes
  }

}