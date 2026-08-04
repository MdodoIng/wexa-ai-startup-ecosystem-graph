/**
 * Convert Neo4j driver values (Integer, etc.) into plain JS types
 * so res.json() never emits { low, high } objects.
 */
function toNative(value) {
  if (value === null || value === undefined) return value;

  // neo4j-driver Integer
  if (typeof value === "object" && typeof value.toNumber === "function") {
    return value.toNumber();
  }

  // Plain object / node properties
  if (
    typeof value === "object" &&
    !Array.isArray(value) &&
    value.constructor === Object
  ) {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = toNative(v);
    }
    return out;
  }

  if (Array.isArray(value)) {
    return value.map(toNative);
  }

  return value;
}

/** Normalize a Neo4j node properties bag */
function nodeProps(nodeOrProps) {
  if (!nodeOrProps) return {};
  const props =
    nodeOrProps.properties !== undefined ? nodeOrProps.properties : nodeOrProps;
  return toNative(props);
}

module.exports = { toNative, nodeProps };
