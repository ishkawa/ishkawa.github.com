import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const sections = [];
  for (const edge of data.allMarkdownRemark.edges) {
    const date = new Date(edge.node.frontmatter.date)
    const matchedSection = sections.find(e => e.year === date.getFullYear())
    if (matchedSection) {
      matchedSection.edges.push(edge)
    } else {
      const newSection = {year: date.getFullYear(), edges: [edge]}
      sections.push(newSection)
    }
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      {sections.map(section => {
        return (
          <div>
            <h2>{section.year}</h2>
            <ul>
              {section.edges.map(({ node }) => {
                const title = node.frontmatter.title || node.fields.slug
                return (
                  <li>
                    <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                      {title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            description
          }
        }
      }
    }
  }
`
