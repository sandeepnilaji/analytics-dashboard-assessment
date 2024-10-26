export function processChartData(data) {
  const cleanData = data.filter((item) => item["VIN (1-10)"]);

  const makeCount = cleanData.reduce((acc, item) => {
    const make = item["Make"];
    acc[make] = (acc[make] || 0) + 1;
    return acc;
  }, {});

  const evTypeCount = cleanData.reduce((acc, item) => {
    const evType = item["Electric Vehicle Type"];
    acc[evType] = (acc[evType] || 0) + 1;
    return acc;
  }, {});

  const cityCount = cleanData.reduce((acc, item) => {
    const city = item["City"];
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const yearDistribution = cleanData.reduce((acc, item) => {
    const year = item["Model Year"];
    acc[year] = (acc[year] || 0) + 1;
    return acc;
  }, {});

  const electricRangeByMake = cleanData.reduce((acc, item) => {
    const make = item["Make"];
    const range = parseInt(item["Electric Range"]) || 0;
    if (!acc[make]) {
      acc[make] = { total: 0, count: 0 };
    }
    acc[make].total += range;
    acc[make].count += 1;
    return acc;
  }, {});

  const avgElectricRangeByMake = Object.entries(electricRangeByMake)
    .map(([make, data]) => ({
      make,
      avgRange: data.total / data.count,
    }))
    .sort((a, b) => b.avgRange - a.avgRange)
    .slice(0, 10);

  const cafvEligibility = cleanData.reduce((acc, item) => {
    const eligibility =
      item["Clean Alternative Fuel Vehicle (CAFV) Eligibility"];
    acc[eligibility] = (acc[eligibility] || 0) + 1;
    return acc;
  }, {});

  return {
    makeCount,
    evTypeCount,
    cityCount,
    yearDistribution,
    avgElectricRangeByMake,
    cafvEligibility,
  };
}

export function getUniqueValues(data, key) {
  return [...new Set(data?.map((item) => item[key]))];
}
