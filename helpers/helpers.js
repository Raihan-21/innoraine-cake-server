const sqlConditionGenerator = (queryObject) => {
  let queryCondition = "";
  let queryValues = [];
  console.log(queryObject);
  const validQuery = Object.keys(queryObject).filter(
    (query) => queryObject[query]
  );
  validQuery.forEach((query, i) => {
    if (i === 0) {
      queryCondition += "WHERE " + query + "= $" + Number(i + 1);
      queryValues.push(queryObject[query]);
      return;
    }
    queryCondition += "AND " + query + "= $" + Number(i + 1);
    queryValues.push(queryObject[query]);
  });
  return { queryCondition, queryValues };
};

module.exports = { sqlConditionGenerator };
