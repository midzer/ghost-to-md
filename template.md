+++<% if (post.category) { %>
categories = ${post.category}<% } %><% if (post.date) { %>
date = ${post.date}<% } %><% if (post.disclaimer) { %>
disclaimer = ${post.disclaimer}<% } %><% if (post.draft) { %>
draft = ${post.draft}<% } %><% if (post.email) { %>
email = ${post.email}<% } %><% if (post.facebook) { %>
facebook = ${post.facebook}<% } %><% if (post.lastmod) { %>
lastmod = ${post.lastmod}<% } %><% if (post.preamble) { %>
preamble = ${post.preamble}<% } %><% if (post.primaryImage) { %>
primary_image = ${post.primaryImage}<% } %><% if (post.publishDate) { %>
publishDate = ${post.publishDate}<% } %><% if (post.shortDescription) { %>
short_description = ${post.shortDescription}<% } %><% if (post.shortBio) { %>
short_bio = ${post.shortBio}<% } %>
slug = ${post.slug}<% if (post.title) { %>
title = ${post.title}<% } %><% if (post.twitter) { %>
twitter = ${post.twitter}<% } %><% if (post.website) { %>
website = ${post.website}<% } %><% if (post.youtube) { %>
youtube_url = ${post.youtube}<% } %>
+++

${post.body}
