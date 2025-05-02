// SSC API Token
const SECURITYSCORECARD_API_TOKEN = 'Iequsf9EIK1rOiPK4y7lTonkR0MU';


/**---------------------------------------------------------------------------------------- */
/**
 * Fetches the portfolio ID based on the portfolio name.
 *
 * @param {string} portfolioName The portfolio name to search for.
 * @return {string} The portfolio ID if found, or a message if not found.
 * @customfunction
 */
function getPortfolioIdByName(portfolioName) {
  if (!portfolioName) {
    return "Please provide a portfolio name.";
  }

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json; charset=utf-8',
      Authorization: `Token ${SECURITYSCORECARD_API_TOKEN}`
    }
  };

  const url = 'https://api.securityscorecard.io/portfolios';

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (!json.entries || json.entries.length === 0) {
      return "No portfolios found.";
    }

    // Search for the portfolio by name (case-insensitive)
    const portfolio = json.entries.find(entry => entry.name.toLowerCase() === portfolioName.toLowerCase());

    if (portfolio) {
      return portfolio.id;  // Return the portfolio ID if the name matches (case-insensitive)
    } else {
      return "Portfolio not found.";
    }
  } catch (error) {
    return `Error: ${error.message}`;
  }
}



/**---------------------------------------------------------------------------------------- */
/**
 * Fetches domains from a specific SecurityScorecard portfolio by name.
 *
 * @param {string} portfolioName The portfolio name to query.
 * @return {Array} A vertical list of domains from the portfolio.
 * @customfunction
 */
function getSecurityScorecardDomains(portfolioName) {
  if (!portfolioName) {
    return [["Missing portfolio name"]];
  }

  // Retrieve the portfolio ID using the portfolio name
  const portfolioId = getPortfolioIdByName(portfolioName);

  // If portfolio ID retrieval failed, return an error message
  if (portfolioId === "Portfolio not found" || portfolioId === "Please provide a portfolio name.") {
    return [[portfolioId]]; // Return the error message from getPortfolioIdByName
  }

  const url = `https://api.securityscorecard.io/portfolios/${portfolioId}/companies`;

  const options = {
    method: 'get',
    headers: {
      accept: 'application/json; charset=utf-8',
      Authorization: `Token ${SECURITYSCORECARD_API_TOKEN}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (!json.entries || json.entries.length === 0) {
      return [["No companies found"]];
    }

    // Return a vertical list of domains (2D array for Sheets)
    return json.entries.map(entry => [entry.domain]);
  } catch (error) {
    return [[`Error: ${error.message}`]];
  }
}


/**---------------------------------------------------------------------------------------- */
/**
 * Fetches domains from companies in a specific SecurityScorecard portfolio with a given grade.
 *
 * @param {string} portfolioName The name of the portfolio to query.
 * @param {string} grade The letter grade to filter companies (e.g., "A").
 * @return {Array} A vertical list of domains for companies with the specified grade.
 * @customfunction
 */
function getCompaniesByGrade(portfolioName, grade) {
  if (!portfolioName || !grade) {
    return [["Missing portfolio name or grade"]];
  }

  // Resolve the portfolio ID using the portfolio name
  const portfolioId = getPortfolioIdByName(portfolioName);

  if (portfolioId === "Portfolio not found" || portfolioId === "Please provide a portfolio name.") {
    return [[portfolioId]];  // Propagate the error message from the lookup function
  }

  const url = `https://api.securityscorecard.io/portfolios/${portfolioId}/companies?grade=${grade}`;

  const options = {
    method: 'get',
    headers: {
      accept: 'application/json; charset=utf-8',
      Authorization: `Token ${SECURITYSCORECARD_API_TOKEN}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (!json.entries || json.entries.length === 0) {
      return [["No companies found"]];
    }

    // Return only domains in a vertical list (2D array for Sheets)
    return json.entries.map(entry => [entry.domain]);
  } catch (error) {
    return [[`Error: ${error.message}`]];
  }
}

/**
 * Fetches domains of companies in a portfolio that had a breach within the specified number of days.
 *
 * @param {string} portfolioName The name of the SecurityScorecard portfolio.
 * @param {number} days The number of days to look back for breaches.
 * @return {Array} A list of company domains with breaches in the given period.
 * @customfunction
 */
function getBreachedCompaniesByDays(portfolioName, days) {
  if (!portfolioName || !days) {
    return [["Missing portfolio name or number of days"]];
  }

  const portfolioId = getPortfolioIdByName(portfolioName);

  if (!portfolioId || portfolioId === "Portfolio not found" || portfolioId === "Please provide a portfolio name.") {
    return [[portfolioId]];
  }

  const url = `https://api.securityscorecard.io/portfolios/${portfolioId}/companies?had_breach_within_last_days=${days}`;

  const options = {
    method: 'get',
    headers: {
      accept: 'application/json; charset=utf-8',
      Authorization: `Token ${SECURITYSCORECARD_API_TOKEN}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (!json.entries || json.entries.length === 0) {
      return [["No breached companies found"]];
    }

    return json.entries.map(entry => [entry.domain]);
  } catch (error) {
    return [[`Error: ${error.message}`]];
  }
}


/**
 * Fetches domains of companies in a SecurityScorecard portfolio affected by a specific CVE.
 *
 * @param {string} portfolioName The name of the SecurityScorecard portfolio.
 * @param {string} cve The CVE identifier to filter companies by (e.g., "CVE-2016-0800").
 * @return {Array} A vertical list of company domains affected by the specified CVE.
 * @customfunction
 */
function getCompaniesByCVE(portfolioName, cve) {
  if (!portfolioName || !cve) {
    return [["Missing portfolio name or CVE"]];
  }

  const portfolioId = getPortfolioIdByName(portfolioName);

  if (!portfolioId || portfolioId === "Portfolio not found" || portfolioId === "Please provide a portfolio name.") {
    return [[portfolioId]];
  }

  const url = `https://api.securityscorecard.io/portfolios/${portfolioId}/companies?vulnerability=${encodeURIComponent(cve)}`;

  const options = {
    method: 'get',
    headers: {
      accept: 'application/json; charset=utf-8',
      Authorization: `Token ${SECURITYSCORECARD_API_TOKEN}`
    },
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());

    if (!json.entries || json.entries.length === 0) {
      return [["No companies found for given CVE"]];
    }

    return json.entries.map(entry => [entry.domain]);
  } catch (error) {
    return [[`Error: ${error.message}`]];
  }
}

