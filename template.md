+++<% if (post.author) { %>
author = ${post.author}<% } %><% if (post.category) { %>
categories = ${post.category}<% } %><% if (post.companies) { %>
companies = ${post.companies}<% } %><% if (post.date) { %>
date = ${post.date}<% } %><% if (post.discipline) { %>
discipline = ${post.discipline}<% } %><% if (post.disclaimer) { %>
disclaimer = ${post.disclaimer}<% } %><% if (post.draft) { %>
draft = ${post.draft}<% } %><% if (post.email) { %>
email = ${post.email}<% } %><% if (post.lastmod) { %>
lastmod = ${post.lastmod}<% } %><% if (post.people) { %>
people = ${post.people}<% } %><% if (post.preamble) { %>
preamble = ${post.preamble}<% } %><% if (post.primaryImage) { %>
primary_image = ${post.primaryImage}<% } %><% if (post.primaryImageCredit) { %>
primary_image_credit = ${post.primaryImageCredit}<% } %><% if (post.publishDate) { %>
publishDate = ${post.publishDate}<% } %><% if (post.shortDescription) { %>
short_description = ${post.shortDescription}<% } %><% if (post.shortBio) { %>
short_bio = ${post.shortBio}<% } %>
slug = ${post.slug}<% if (post.title) { %>
title = ${post.title}<% } %><% if (post.type_of_company) { %>
type_of_company = ${post.type_of_company}<% } %><% if (post.website) { %>
website = ${post.website}<% } %><% if (post.facebook) { %>
[[social_media]]
platform = "Facebook"
template = "social-media"
url = ${post.facebook}<% } %><% if (post.twitter) { %>
[[social_media]]
platform = " Twitter"
template = "social-media"
url = ${post.twitter}<% } %><% if (post.instagram) { %>
[[social_media]]
platform = "Instagram"
template = "social-media"
url = ${post.instagram}<% } %><% if (post.youtube) { %>
[[social_media]]
platform = "Youtube"
template = "social-media"
url = ${post.youtube}<% } %><% if (post.linkedin) { %>
[[social_media]]
platform = "Linkedin"
template = "social-media"
url = ${post.linkedin}<% } %><% if (post.soundcloud) { %>
[[social_media]]
platform = "Soundcloud"
template = "social-media"
url = ${post.soundcloud}<% } %>
+++

${post.body}
