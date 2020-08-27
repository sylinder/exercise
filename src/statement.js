function calculateCredit(invoice, plays) {
  let volumeCredits = 0;
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    volumeCredits += Math.max(perf.audience - 30, 0);
    if ('comedy' === play.type) volumeCredits += Math.floor(perf.audience / 5);
  }
  return volumeCredits
}

function calculateAmount(play, perf) {
  let thisAmount = 0;
  switch (play.type) {
    case 'tragedy':
      thisAmount = 40000;
      if (perf.audience > 30) {
        thisAmount += 1000 * (perf.audience - 30);
      }
      break;
    case 'comedy':
      thisAmount = 30000;
      if (perf.audience > 20) {
        thisAmount += 10000 + 500 * (perf.audience - 20);
      }
      thisAmount += 300 * perf.audience;
      break;
      default:
        throw new Error(`unknown type: ${play.type}`);
  }
  return thisAmount;
}

function formatFunction() {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format;
}

function calculateTotalAmount(invoice, plays) {
  let totalAmount = 0;
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    totalAmount += calculateAmount(play, perf);
  }
  return totalAmount;
}

function generateData(invoice, plays) {
  let data = {};
  let items = [];
  for (let perf of invoice.performances) {
    const play = plays[perf.playID];
    let item = {
      name: play.name,
      amount: calculateAmount(play, perf),
      audience: perf.audience,
    }
    items.push(item);
  }
  data.items = items;
  data.customer = invoice.customer;
  data.totalAmount = calculateTotalAmount(invoice, plays);
  data.volumeCredits = calculateCredit(invoice, plays);
  return data;
}

function renderText(data) {
  let result = `Statement for ${data.customer}\n`;
  const format = formatFunction();
  for (let item of data.items) {
    result += ` ${item.name}: ${format( item.amount/ 100)} (${item.audience} seats)\n`;
  }
  result += `Amount owed is ${format(data.totalAmount / 100)}\n`;
  result += `You earned ${data.volumeCredits} credits \n`;
  return result;
}

function renderHtml(data) {
  let result = `<h1>Statement for ${data.customer}</h1>\n` +
      `<table>\n` +
      `<tr><th>play</th><th>seats</th><th>cost</th></tr>`;
  const format = formatFunction();
  for (let item of data.items) {
    result += ` <tr><td>${item.name}</td><td>${item.audience}</td><td>${format(item.amount/ 100)}</td></tr>\n`;
  }
  result += `</table>\n` +
      `<p>Amount owed is <em>${format(data.totalAmount / 100)}</em></p>\n` +
      `<p>You earned <em>${data.volumeCredits}</em> credits</p>\n`;
  return result;
}

function statement (invoice, plays) {
  return renderText(generateData(invoice, plays));
}

function htmlStatement(invoice, plays) {
  return renderHtml(generateData(invoice, plays));
}

module.exports = {
  statement,
  htmlStatement,
};
