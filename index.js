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
file = file.replace(/\/webhook-uploads\//g, 'https://res.cloudinary.com/schmopera/image/upload/v1545409169/media/webhook-uploads/');
file = file.replace(/.jpg"/g, '.jpg.jpg\"');
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
// Articles + Videos
try {
  fs.readdirSync(outputDirectoryPath + '/articles');
} catch (e) {
  fs.mkdirSync(outputDirectoryPath + '/articles');
}
const articles = {...data.data.articles, ...data.data.videos};
for (var key in articles) {
  if (articles.hasOwnProperty(key)) {
    var article = articles[key];
    var post = {};

    post.title = JSON.stringify(escapeHtml(article.name));
    post.body = article.body;

    if (article.primary_image) {
      post.primaryImage = JSON.stringify(article.primary_image.url);
    }
    if (article.primary_image_credit) {
      post.primaryImageCredit = JSON.stringify(article.primary_image_credit);
    }
    if (article.authors) {
      article.author = article.authors[0].replace('authors ', '');
      let authors = data.data.authors;
      for (var key2 in authors) {
        if (authors.hasOwnProperty(key2)) {
          if (key2 === article.author) {
            var author = authors[key2];
            post.author = JSON.stringify(author.name);
            break;
          }
        }
      }
    }
    if (article.companies) {
      let companies = data.data.companies;
      post.companies = [];
      article.companies.forEach(function(company) {
        company = company.replace('companies ', '');
        for (var key2 in companies) {
          if (companies.hasOwnProperty(key2)) {
            if (key2 === company) {
              post.companies.push(JSON.stringify(companies[key2].name));
              break;
            }
          }
        }
      });
      post.companies = "[" + post.companies + "]";
    }
    if (article.people) {
      let people = data.data.people;
      post.people = [];
      article.people.forEach(function(person) {
        person = person.replace('people ', '');
        for (var key2 in people) {
          if (people.hasOwnProperty(key2)) {
            if (key2 === person) {
              post.people.push(JSON.stringify(people[key2].name));
              break;
            }
          }
        }
      });
      post.people = "[" + post.people + "]";
    }
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
    var slug;
    if (article.slug) {
      slug = article.slug;
    }
    else {
      slug = downcode(convertToSlug(article.name));
    }
    post.slug = JSON.stringify(slug);
    var fileName = slug + '.md';

    // File content.
    var fileContent = postTemplate({
      post: post
    });

    // Get full path to the file we're going to write.
    var filePath = path.resolve(outputDirectoryPath + '/articles', fileName);

    // Write file.
    fs.writeFileSync(filePath, fileContent, {encoding: 'utf8'});
  }
}
// Authors
try {
  fs.readdirSync(outputDirectoryPath + '/authors');
} catch (e) {
  fs.mkdirSync(outputDirectoryPath + '/authors');
}
const authors = data.data.authors;
for (var key in authors) {
  if (authors.hasOwnProperty(key)) {
    var author = authors[key];
    var post = {};

    post.title = JSON.stringify(escapeHtml(author.name));
    post.body = author.long_bio;

    if (author.photo) {
      post.primaryImage = JSON.stringify(author.photo.url);
    }
    if (author.primary_image_credit) {
      post.primaryImageCredit = JSON.stringify(author.primary_image_credit);
    }
    if (author.email) {
      post.email = JSON.stringify(author.email);
    }
    if (author.facebook) {
      post.facebook = JSON.stringify(author.facebook);
    }
    if (author.twitter) {
      post.twitter = JSON.stringify(author.twitter);
    }
    if (author.website) {
      post.website = JSON.stringify(author.website);
    }
    if (author.publish_date) {
      post.publishDate = JSON.stringify(author.publish_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (author.create_date) {
      post.date = JSON.stringify(author.create_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (author.last_updated) {
      post.lastmod = JSON.stringify(author.last_updated);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (author.short_bio) {
      post.shortBio = JSON.stringify(escapeHtml(author.short_bio));
    }
    var slug;
    if (author.slug) {
      slug = author.slug;
      
      // Clean slug for some cases
      slug = slug.replace('authors/', '');
    }
    else {
      slug = downcode(convertToSlug(author.name));
    }
    post.slug = JSON.stringify(slug);
    var fileName = slug + '.md';

    // File content.
    var fileContent = postTemplate({
      post: post
    });

    // Get full path to the file we're going to write.
    var filePath = path.resolve(outputDirectoryPath + '/authors', fileName);

    // Write file.
    fs.writeFileSync(filePath, fileContent, {encoding: 'utf8'});
  }
}
// Companies
try {
  fs.readdirSync(outputDirectoryPath + '/scene');
} catch (e) {
  fs.mkdirSync(outputDirectoryPath + '/scene');
}
try {
  fs.readdirSync(outputDirectoryPath + '/scene/companies');
} catch (e) {
  fs.mkdirSync(outputDirectoryPath + '/scene/companies');
}
const companies = data.data.companies;
for (var key in companies) {
  if (companies.hasOwnProperty(key)) {
    var company = companies[key];
    var post = {};

    post.title = JSON.stringify(escapeHtml(company.name));
    post.body = company.description;

    if (company.photo) {
      post.primaryImage = JSON.stringify(company.photo.url);
    }
    if (company.primary_image_credit) {
      post.primaryImageCredit = JSON.stringify(company.primary_image_credit);
    }
    if (company.email) {
      post.email = JSON.stringify(company.email);
    }
    if (company.type_of_company) {
      post.type_of_company = JSON.stringify(company.type_of_company);
    }
    if (company.social_media) {
      let socialMedia = company.social_media;
      socialMedia.forEach(function(media) {
        let url = JSON.stringify(media.url);
        switch (media.platform) {
          case 'Facebook':
          post.facebook = url;
          break;
          case 'Twitter':
          post.twitter = url;
          break;
          case 'Instagram':
          post.instagram = url;
          break;
          case 'Youtube':
          post.youtube = url;
          break;
          case 'Linkedin':
          post.linkedin = url;
          break;
          case 'Soundcloud':
          post.soundcloud = url;
          break;
        }
      });
    }
    if (company.website_url) {
      post.website = JSON.stringify(company.website_url);
    }
    if (company.publish_date) {
      post.publishDate = JSON.stringify(company.publish_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (company.create_date) {
      post.date = JSON.stringify(company.create_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (company.last_updated) {
      post.lastmod = JSON.stringify(company.last_updated);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    var slug;
    if (company.slug) {
      slug = company.slug;

      // Clean slug for some cases
      slug = slug.replace('scene/companies/', '');
    }
    else {
      slug = downcode(convertToSlug(company.name));
    }
    post.slug = JSON.stringify(slug);
    var fileName = slug + '.md';

    // File content.
    var fileContent = postTemplate({
      post: post
    });

    // Get full path to the file we're going to write.
    var filePath = path.resolve(outputDirectoryPath + '/scene/companies', fileName);

    // Write file.
    fs.writeFileSync(filePath, fileContent, {encoding: 'utf8'});
  }
}
// People
try {
  fs.readdirSync(outputDirectoryPath + '/scene/people');
} catch (e) {
  fs.mkdirSync(outputDirectoryPath + '/scene/people');
}
const people = data.data.people;
for (var key in people) {
  if (people.hasOwnProperty(key)) {
    var person = people[key];
    var post = {};

    post.title = JSON.stringify(escapeHtml(person.name));
    post.body = person.biography;

    if (person.headshot) {
      post.primaryImage = JSON.stringify(person.headshot.url);
    }
    if (person.headshot_credit) {
      post.primaryImageCredit = JSON.stringify(person.headshot_credit);
    }
    if (person.email) {
      post.email = JSON.stringify(person.email);
    }
    if (person.discipline) {
      post.discipline = JSON.stringify(person.discipline);
    }
    if (person.social_media) {
      let socialMedia = person.social_media;
      socialMedia.forEach(function(media) {
        let url = JSON.stringify(media.url);
        switch (media.platform) {
          case 'Facebook':
          post.facebook = url;
          break;
          case 'Twitter':
          post.twitter = url;
          break;
          case 'Instagram':
          post.instagram = url;
          break;
          case 'Youtube':
          post.youtube = url;
          break;
          case 'Linkedin':
          post.linkedin = url;
          break;
          case 'Soundcloud':
          post.soundcloud = url;
          break;
        }
      });
    }
    if (person.website_url) {
      post.website = JSON.stringify(person.website_url);
    }
    if (person.publish_date) {
      post.publishDate = JSON.stringify(person.publish_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (person.create_date) {
      post.date = JSON.stringify(person.create_date);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    if (person.last_updated) {
      post.lastmod = JSON.stringify(person.last_updated);
    }
    else {
      // some articles might not have been published, so mark them as drafts
      post.draft = 'true'; 
    }
    var slug;
    if (person.slug) {
      slug = person.slug;

      // Clean slug for some cases
      slug = slug.replace('scene/people/', '');
    }
    else {
      slug = downcode(convertToSlug(person.name));
    }
    post.slug = JSON.stringify(slug);
    var fileName = slug + '.md';

    // File content.
    var fileContent = postTemplate({
      post: post
    });

    // Get full path to the file we're going to write.
    var filePath = path.resolve(outputDirectoryPath + '/scene/people', fileName);

    // Write file.
    fs.writeFileSync(filePath, fileContent, {encoding: 'utf8'});
  }
}
