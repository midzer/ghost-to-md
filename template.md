+++<% if (post.category) { %>
categories = ${post.category}<% } %>
date = ${post.date}<% if (post.disclaimer) { %>
disclaimer = ${post.disclaimer}<% } %>
lastmod = ${post.lastmod}<% if (post.preamble) { %>
preamble = ${post.preamble}<% } %>
publishDate = ${post.publishDate}<% if (post.shortDescription) { %>
short_description = ${post.shortDescription}<% } %>
slug = ${post.slug}
title = ${post.title}
+++

${post.body}
