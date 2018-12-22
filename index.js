#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var argv = require('yargs');

argv = argv
  .usage('Migrate your webhook database to markdown files.')
  .example('$0 webhook-export.json', 'Migrates export file.')
  .options('o', {
    describe: 'Output directory.',
    alias: 'output',
    default: 'webhook-to-md-output'
  })
  .options('t', {
    describe: 'Template file.',
    alias: 'template'
  })
  .demand(1)
  .argv;

var LATIN_MAP = {
  'À': 'A', 'Á': 'A', 'Â': 'A', 'Ã': 'A', 'Ä': 'A', 'Å': 'A', 'Æ': 'AE', 'Ç':
  'C', 'È': 'E', 'É': 'E', 'Ê': 'E', 'Ë': 'E', 'Ì': 'I', 'Í': 'I', 'Î': 'I',
  'Ï': 'I', 'Ð': 'D', 'Ñ': 'N', 'Ò': 'O', 'Ó': 'O', 'Ô': 'O', 'Õ': 'O', 'Ö':
  'O', 'Ő': 'O', 'Ø': 'O', 'Ù': 'U', 'Ú': 'U', 'Û': 'U', 'Ü': 'U', 'Ű': 'U',
  'Ý': 'Y', 'Þ': 'TH', 'Ÿ': 'Y', 'ß': 'ss', 'à':'a', 'á':'a', 'â': 'a', 'ã':
  'a', 'ä': 'a', 'å': 'a', 'æ': 'ae', 'ç': 'c', 'è': 'e', 'é': 'e', 'ê': 'e',
  'ë': 'e', 'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i', 'ð': 'd', 'ñ': 'n', 'ò':
  'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o', 'ő': 'o', 'ø': 'o', 'ù': 'u',
  'ú': 'u', 'û': 'u', 'ü': 'u', 'ű': 'u', 'ý': 'y', 'þ': 'th', 'ÿ': 'y'
};
var LATIN_SYMBOLS_MAP = {
  '©':'(c)'
};
var GREEK_MAP = {
  'α':'a', 'β':'b', 'γ':'g', 'δ':'d', 'ε':'e', 'ζ':'z', 'η':'h', 'θ':'8',
  'ι':'i', 'κ':'k', 'λ':'l', 'μ':'m', 'ν':'n', 'ξ':'3', 'ο':'o', 'π':'p',
  'ρ':'r', 'σ':'s', 'τ':'t', 'υ':'y', 'φ':'f', 'χ':'x', 'ψ':'ps', 'ω':'w',
  'ά':'a', 'έ':'e', 'ί':'i', 'ό':'o', 'ύ':'y', 'ή':'h', 'ώ':'w', 'ς':'s',
  'ϊ':'i', 'ΰ':'y', 'ϋ':'y', 'ΐ':'i',
  'Α':'A', 'Β':'B', 'Γ':'G', 'Δ':'D', 'Ε':'E', 'Ζ':'Z', 'Η':'H', 'Θ':'8',
  'Ι':'I', 'Κ':'K', 'Λ':'L', 'Μ':'M', 'Ν':'N', 'Ξ':'3', 'Ο':'O', 'Π':'P',
  'Ρ':'R', 'Σ':'S', 'Τ':'T', 'Υ':'Y', 'Φ':'F', 'Χ':'X', 'Ψ':'PS', 'Ω':'W',
  'Ά':'A', 'Έ':'E', 'Ί':'I', 'Ό':'O', 'Ύ':'Y', 'Ή':'H', 'Ώ':'W', 'Ϊ':'I',
  'Ϋ':'Y'
};
var TURKISH_MAP = {
  'ş':'s', 'Ş':'S', 'ı':'i', 'İ':'I', 'ç':'c', 'Ç':'C', 'ü':'u', 'Ü':'U',
  'ö':'o', 'Ö':'O', 'ğ':'g', 'Ğ':'G'
};
var RUSSIAN_MAP = {
  'а':'a', 'б':'b', 'в':'v', 'г':'g', 'д':'d', 'е':'e', 'ё':'yo', 'ж':'zh',
  'з':'z', 'и':'i', 'й':'j', 'к':'k', 'л':'l', 'м':'m', 'н':'n', 'о':'o',
  'п':'p', 'р':'r', 'с':'s', 'т':'t', 'у':'u', 'ф':'f', 'х':'h', 'ц':'c',
  'ч':'ch', 'ш':'sh', 'щ':'sh', 'ъ':'', 'ы':'y', 'ь':'', 'э':'e', 'ю':'yu',
  'я':'ya',
  'А':'A', 'Б':'B', 'В':'V', 'Г':'G', 'Д':'D', 'Е':'E', 'Ё':'Yo', 'Ж':'Zh',
  'З':'Z', 'И':'I', 'Й':'J', 'К':'K', 'Л':'L', 'М':'M', 'Н':'N', 'О':'O',
  'П':'P', 'Р':'R', 'С':'S', 'Т':'T', 'У':'U', 'Ф':'F', 'Х':'H', 'Ц':'C',
  'Ч':'Ch', 'Ш':'Sh', 'Щ':'Sh', 'Ъ':'', 'Ы':'Y', 'Ь':'', 'Э':'E', 'Ю':'Yu',
  'Я':'Ya'
};
var UKRAINIAN_MAP = {
  'Є':'Ye', 'І':'I', 'Ї':'Yi', 'Ґ':'G', 'є':'ye', 'і':'i', 'ї':'yi', 'ґ':'g'
};
var CZECH_MAP = {
  'č':'c', 'ď':'d', 'ě':'e', 'ň': 'n', 'ř':'r', 'š':'s', 'ť':'t', 'ů':'u',
  'ž':'z', 'Č':'C', 'Ď':'D', 'Ě':'E', 'Ň': 'N', 'Ř':'R', 'Š':'S', 'Ť':'T',
  'Ů':'U', 'Ž':'Z'
};
var POLISH_MAP = {
  'ą':'a', 'ć':'c', 'ę':'e', 'ł':'l', 'ń':'n', 'ó':'o', 'ś':'s', 'ź':'z',
  'ż':'z', 'Ą':'A', 'Ć':'C', 'Ę':'E', 'Ł':'L', 'Ń':'N', 'Ó':'O', 'Ś':'S',
  'Ź':'Z', 'Ż':'Z'
};
var LATVIAN_MAP = {
  'ā':'a', 'č':'c', 'ē':'e', 'ģ':'g', 'ī':'i', 'ķ':'k', 'ļ':'l', 'ņ':'n',
  'š':'s', 'ū':'u', 'ž':'z', 'Ā':'A', 'Č':'C', 'Ē':'E', 'Ģ':'G', 'Ī':'I',
  'Ķ':'K', 'Ļ':'L', 'Ņ':'N', 'Š':'S', 'Ū':'U', 'Ž':'Z'
};
var ARABIC_MAP = {
  'أ':'a', 'ب':'b', 'ت':'t', 'ث': 'th', 'ج':'g', 'ح':'h', 'خ':'kh', 'د':'d',
  'ذ':'th', 'ر':'r', 'ز':'z', 'س':'s', 'ش':'sh', 'ص':'s', 'ض':'d', 'ط':'t',
  'ظ':'th', 'ع':'aa', 'غ':'gh', 'ف':'f', 'ق':'k', 'ك':'k', 'ل':'l', 'م':'m',
  'ن':'n', 'ه':'h', 'و':'o', 'ي':'y'
};
var LITHUANIAN_MAP = {
  'ą':'a', 'č':'c', 'ę':'e', 'ė':'e', 'į':'i', 'š':'s', 'ų':'u', 'ū':'u',
  'ž':'z',
  'Ą':'A', 'Č':'C', 'Ę':'E', 'Ė':'E', 'Į':'I', 'Š':'S', 'Ų':'U', 'Ū':'U',
  'Ž':'Z'
};
var SERBIAN_MAP = {
  'ђ':'dj', 'ј':'j', 'љ':'lj', 'њ':'nj', 'ћ':'c', 'џ':'dz', 'đ':'dj',
  'Ђ':'Dj', 'Ј':'j', 'Љ':'Lj', 'Њ':'Nj', 'Ћ':'C', 'Џ':'Dz', 'Đ':'Dj'
};
var AZERBAIJANI_MAP = {
  'ç':'c', 'ə':'e', 'ğ':'g', 'ı':'i', 'ö':'o', 'ş':'s', 'ü':'u',
  'Ç':'C', 'Ə':'E', 'Ğ':'G', 'İ':'I', 'Ö':'O', 'Ş':'S', 'Ü':'U'
};

var ALL_DOWNCODE_MAPS = [
  LATIN_MAP,
  LATIN_SYMBOLS_MAP,
  GREEK_MAP,
  TURKISH_MAP,
  RUSSIAN_MAP,
  UKRAINIAN_MAP,
  CZECH_MAP,
  POLISH_MAP,
  LATVIAN_MAP,
  ARABIC_MAP,
  LITHUANIAN_MAP,
  SERBIAN_MAP,
  AZERBAIJANI_MAP
];

var Downcoder = {
  'Initialize': function() {
    if (Downcoder.map) {  // already made
      return;
    }
    Downcoder.map = {};
    Downcoder.chars = [];
    for (var i=0; i<ALL_DOWNCODE_MAPS.length; i++) {
      var lookup = ALL_DOWNCODE_MAPS[i];
        for (var c in lookup) {
          if (lookup.hasOwnProperty(c)) {
            Downcoder.map[c] = lookup[c];
          }
        }
      }
      for (var k in Downcoder.map) {
        if (Downcoder.map.hasOwnProperty(k)) {
          Downcoder.chars.push(k);
        }
      }
      Downcoder.regex = new RegExp(Downcoder.chars.join('|'), 'g');
    }
};

function downcode(slug) {
    Downcoder.Initialize();
    return (slug || '').replace(Downcoder.regex, function(m) {
        return Downcoder.map[m];
    });
}


// Get full path to output directory
var outputDirectoryPath = path.resolve(argv.output);

// Try to read the output directory, create it if it doesn't exist.
try {
  fs.readdirSync(outputDirectoryPath);
} catch (e) {
  fs.mkdirSync(outputDirectoryPath);
}

// Try to read the export file from the file system and parse it as JSON data.
try {
  var file = fs.readFileSync(path.resolve(argv._[0]), {encoding: 'utf8'});
} catch (e) {
  console.error('Could not parse export file:', e.path);
  return 0;
}

// Replace all images
file = file.replace(/\/webhook-uploads\//g, 'https://res.cloudinary.com/schmopera/image/upload/v1545409169/media/webhook-uploads/')
var data = JSON.parse(file);

/**
 * The path to the template file.  If it's given as an argument than its
 * relative to where the script is being ran from, otherwise we take it
 * from this script's location.
 * @type {string}
 */
var templatePath = argv.template ? path.resolve(argv.template) :
                                   path.resolve(__dirname, 'template.md');

/**
 * Read in template string.
 * @type {string}
 */
var templateStr = fs.readFileSync(templatePath, {encoding: 'utf8'});

/**
 * Precompile post template.
 * @type {Function}
 */
var postTemplate = _.template(templateStr);

/**
 * Converts an array to a map.
 * @param  {Array} array  Array object we're transforming.
 * @param  {string} mapKey The property we're using to get the key for the
 *  dictionary.
 * @return {Object} The transformed array.
 */
function arrayToMap(array, mapKey) {
  var mapObj = {};
  mapKey = mapKey || 'id';
  /*array.forEach(function(item) {
    mapObj[item[mapKey]] = item;
  });*/
  for (var key in array) {
    if (array.hasOwnProperty(key)) {
        mapObj[array[key][mapKey]] = array[key];
    }
}

  return mapObj;
}

/**
 * Given a time string or integer value we will format it into a human readable
 * string.
 * @param  {string|number} timeStr A time value, in the form of '1406827588763'.
 * @return {string}  Human readable string, such as '2014-10-08'.
 */
/*function formatDate(timeStr) {
  function ensure0Padding(val) {
    return val < 10 ? '0' + val : val;
  }

  var publishedDate = new Date(timeStr);

  var date = [
    publishedDate.getFullYear(),
    ensure0Padding(publishedDate.getMonth() + 1),
    ensure0Padding(publishedDate.getDate())
  ];

  return date.join('-');
}*/

/**
 { id: 1,
   uuid: '496e4476-6345-4b64-9779-7166cd957070',
   key: 'databaseVersion',
   value: '003',
   type: 'core',
   created_at: 1388436339288,
   created_by: 1,
   updated_at: 1388436339288,
   updated_by: 1 }
 */
//var settings = data.db[0].data.settings;
//var settings = data.data.settings;

/**
 { id: 2, post_id: 3, tag_id: 360 }
 */
//var postsTags = {};
/*data.db[0].data.posts_tags.forEach(function(item) {
  postsTags[item.post_id] = postsTags[item.post_id] || [];
  postsTags[item.post_id].push(item.tag_id);
});*/
/*var articles = data.data.articles;
for (var key in articles) {
    if (articles.hasOwnProperty(key)) {
        postsTags[key] = postsTags[articles[key]] || [];
        //postsTags[key].push(item.tag_id);
    }
}*/

/**
 { id: 1,
   uuid: '920afa0b-f8f1-4d55-a75d-e0470bfd300c',
   name: 'Getting Started',
   slug: 'getting-started',
   description: null,
   parent_id: null,
   meta_title: null,
   meta_description: null,
   created_at: 1388436339245,
   created_by: 1,
   updated_at: 1388436339245,
   updated_by: 1,
   image: null,
   hidden: 0 }
 */
//var tags = arrayToMap(data.db[0].data.tags);
//var tags = arrayToMap(data.data.tags);

/**
 { id: 2,
  uuid: '6a583a87-7f37-4b51-976a-cd6b5b809d56',
  title: 'Hello world!',
  slug: 'hello-world',
  markdown: 'This is your first post.',
  html: '<p>This is your first post.</p>',
  image: null,
  featured: 0,
  page: 0,
  status: 'published',
  language: 'en_US',
  meta_title: null,
  meta_description: null,
  author_id: 1,
  created_at: 1263372815000,
  created_by: 1,
  updated_at: 1263372815000,
  updated_by: 1,
  published_at: 1263372815000,
  published_by: 1 }
 */
//data.db[0].data.posts.forEach(function(post) {
function convertToSlug(text)
{
    return text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

function escapeHtml(text) {
  return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

/*function convertToSlug(text) {
  if (text.charAt(0) === '/') {
    text = text.substr(1);
  }
  if (text.substr(-1) === '/') {
    text = text.slice(0, -1);
  }
  text = text.replace(/\s+/g, '-');
  text = downcode(text);
  return text;
}*/
const articles = {...data.data.articles, ...data.data.videos};
for (var key in articles) {
  if (articles.hasOwnProperty(key)) {
  var article = articles[key];
  var post = {};

  //var postTags = postsTags[post.id] || [];
  //post.tags = [];

  // Add each tag to the post.
  // postTags.forEach(function(tagId) {
  //   var tag = tags[tagId];
  //   if (tag) {
  //     post.tags.push(tag.name);
  //   }
  // });

  //post.title = post.title.indexOf(':') > 1 ? '"' + post.title + '"' : post.title;
  post.title = JSON.stringify(escapeHtml(article.name));
  post.body = article.body;

  if (article.category) {
    article.category = article.category.replace('categories ', '');
    var categories = data.data.categories;
    for (var key2 in categories) {
      if (categories.hasOwnProperty(key2)) {
        if (key2 === article.category) {
          var category = categories[key2];
          post.category = JSON.stringify(category.name);
          break;
        }
      }
    }
  }
  if (article.youtube_url) {
    post.youtube = JSON.stringify(article.youtube_url.original_url);
  }
  // Convert to ISO string.
  //post.publishedAt = new Date(post.published_at).toISOString();
  //post.updatedAt = new Date(post.updated_at).toISOString();
  if (article.publish_date) {
    post.publishDate = JSON.stringify(article.publish_date);
  }
  else {
    // some articles might not have been published, so mark them as drafts
    post.draft = 'true'; 
  }
  if (article.create_date) {
    post.date = JSON.stringify(article.create_date);
  }
  else {
    // some articles might not have been published, so mark them as drafts
    post.draft = 'true'; 
  }
  if (article.last_updated) {
    post.lastmod = JSON.stringify(article.last_updated);
  }
  else {
    // some articles might not have been published, so mark them as drafts
    post.draft = 'true'; 
  }
  if (article.disclaimer) {
    post.disclaimer = JSON.stringify(article.disclaimer);
  }
  if (article.preamble) {
    post.preamble = JSON.stringify(article.preamble);
  }
  if (article.short_description) {
    post.shortDescription = JSON.stringify(escapeHtml(article.short_description));
  }
  //post.formattedDate = formatDate(post.published_at);

  // Format the file name we're going to save.
  // Will be in the form of '2014-10-11-post-slug.md';
  //var fileName = post.formattedDate + '-' + post.slug + '.md';
  var slug;
  if (article.slug) {
    slug = article.slug;
  }
  else {
    slug = downcode(convertToSlug(article.name));
  }
  post.slug = JSON.stringify(slug);
  var fileName = slug + '.md';

  // If this entry is a page then rename the file name.
  // if (post.page) {
  //   fileName = 'page-' + post.slug + '.md';
  // }

  // File content.
  var fileContent = postTemplate({
    post: post
  });

  // Get full path to the file we're going to write.
  var filePath = path.resolve(outputDirectoryPath, fileName);

  // Write file.
  fs.writeFileSync(filePath, fileContent, {encoding: 'utf8'});
}
//});
}
