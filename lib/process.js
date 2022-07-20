const _ = require('lodash')

const copyFields = [
  "slug",
  "contentGroupId",
  "campaign",
  "categoryId",
  "state",
  "templatePath",
  "name",
  "mabExperimentId",
  "archived",
  "authorName",
  "abTestId",
  "createdById",
  "updatedById",
  "domain",
  "subcategory",
  "abStatus",
  "folderId",
  "language",
  "translatedFromId",
  "dynamicPageHubDbTableId",
  "attachedStylesheets",
  "includeDefaultCustomCss",
  "enableDomainStylesheets",
  "enableLayoutStylesheets",
  "htmlTitle",
  "metaDescription",
  "publishImmediately",
  "headHtml",
  "footerHtml",
  "contentTypeCategory",
  "currentState",
  "linkRelCanonicalUrl",
  "pageRedirected",
  "pageExpiryEnabled",
  "pageExpiryDate",
  "pageExpiryRedirectId",
  "pageExpiryRedirectUrl",
  "featuredImage",
  "useFeaturedImage",
  "featuredImageAltText",
  "publicAccessRulesEnabled",
  "publicAccessRules",
  "themeSettingsValues",
  // "url",
  "createdAt",
  "updatedAt",
  "layoutSections"
]

function process(data, customizer) {

  const result = {}

  // First, copy the copy fields
  for(let field of copyFields) {
    if (data.hasOwnProperty(field)) {
      result[field] = _.cloneDeepWith(data[field], customizer)
    }
  }

  // Now, we also need to crawl the entire deep object structure and apply a mapping

  return result
}

module.exports = process
