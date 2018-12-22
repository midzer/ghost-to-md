+++<% if (post.category) { %>
categories = ${post.category}<% } %><% if (post.date) { %>
date = ${post.date}<% } %><% if (post.disclaimer) { %>
disclaimer = ${post.disclaimer}<% } %><% if (post.draft) { %>
draft = ${post.draft}<% } %><% if (post.lastmod) { %>
lastmod = ${post.lastmod}<% } %><% if (post.preamble) { %>
preamble = ${post.preamble}<% } %><% if (post.publishDate) { %>
publishDate = ${post.publishDate}<% } %><% if (post.shortDescription) { %>
short_description = ${post.shortDescription}<% } %>
slug = ${post.slug}
title = ${post.title}<% if (post.youtube) { %>
youtube_url = ${post.youtube}<% } %>
+++

${post.body}
