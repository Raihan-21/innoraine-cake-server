const sqlConditionGenerator = (queryObject, searchObject) => {
  let queryCondition = "";
  let queryValues = [];
  const validQuery = Object.keys(queryObject).filter(
    (query) => queryObject[query]
  );
  validQuery.forEach((query, i) => {
    if (i === 0) {
      queryCondition += "WHERE " + query + "= $" + Number(i + 1);
      queryValues.push(queryObject[query]);
      return;
    }

    // if (query === "search")
    queryCondition += "AND " + query + "= $" + Number(i + 1);
    queryValues.push(queryObject[query]);
  });
  if (Object.values(searchObject)[0]) {
    Object.keys(searchObject).forEach((query) => {
      if (queryValues.length) {
        queryCondition +=
          "AND " + query + "LIKE '%$" + Number(queryValues.length + 1) + "%'";
        return;
      }
      // }
      queryCondition += "WHERE to_tsvector(" + query + ") @@ to_tsquery($1)";
      queryValues.push(searchObject[query]);
    });
  }
  return { queryCondition, queryValues };
};

module.exports = { sqlConditionGenerator };
