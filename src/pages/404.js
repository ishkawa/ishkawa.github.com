import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const NotFoundPage = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="404: Not Found" />
      <h1>Not Found</h1>
      <p>
        指定されたURLのページはありませんでした。<br/>
        古い記事は<a href="https://github.com/ishkawa/ishkawa.github.com/tree/087627d498780c1d06a4954422bf2fc65b799093/_posts">GitHubのリポジトリ</a>に残っているかも知れません。
      </p>
    </Layout>
  )
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
