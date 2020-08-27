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
  let volumeCredits = data.volumeCredits;
  let result = `Statement for ${data.customer}\n`;
  const format = formatFunction();
  for (let item of data.items) {
    result += ` ${item.name}: ${format( item.amount/ 100)} (${item.audience} seats)\n`;
  }
  result += `Amount owed is ${format(data.totalAmount / 100)}\n`;
  result += `You earned ${volumeCredits} credits \n`;
  return result;
}

function statement (invoice, plays) {
  return renderText(generateData(invoice, plays));
}

module.exports = {
  statement,
};
